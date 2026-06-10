import fs from "fs";
import path from "path";
import { ScriptSchema, type Script } from "../schema";
import { generateSpeechWithTimestamps } from "../tts/elevenlabs";
import {
  alignmentToWordTimings,
  captionsToWordTimings,
  wordTimingsToCaptions,
} from "../tts/wordTimings";
import { buildTimeline, type Timeline } from "../tts/align";

export type PrepareResult = {
  audioPublicPath: string;
  captionsPublicPath: string;
  timelinePath: string;
  timeline: Timeline;
  totalSec: number;
};

export async function prepare(
  scriptPath: string,
  publicDir: string,
  options: { voiceId?: string; skipTts?: boolean } = {},
): Promise<PrepareResult> {
  const raw = JSON.parse(fs.readFileSync(scriptPath, "utf-8")) as unknown;
  const script: Script = ScriptSchema.parse(raw);

  const slug = script.meta.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const audioDir = path.join(publicDir, "audio");
  const captionsDir = path.join(publicDir, "captions");
  fs.mkdirSync(audioDir, { recursive: true });
  fs.mkdirSync(captionsDir, { recursive: true });

  const audioFileName = `${slug}.mp3`;
  const audioAbsPath = path.join(audioDir, audioFileName);
  const audioPublicPath = `audio/${audioFileName}`;

  const captionsFileName = `${slug}.json`;
  const captionsAbsPath = path.join(captionsDir, captionsFileName);
  const captionsPublicPath = `captions/${captionsFileName}`;

  let totalSec: number;
  let wordTimings: ReturnType<typeof alignmentToWordTimings>;

  if (options.skipTts) {
    // Skip TTS API — load existing captions to reconstruct word timings
    if (!fs.existsSync(audioAbsPath)) {
      throw new Error(
        `Ses dosyası bulunamadı: public/${audioPublicPath}\n   Önce bir kez --skip-tts olmadan çalıştırın.`,
      );
    }
    if (!fs.existsSync(captionsAbsPath)) {
      throw new Error(
        `Altyazı dosyası bulunamadı: public/${captionsPublicPath}\n   Önce bir kez --skip-tts olmadan çalıştırın.`,
      );
    }
    console.log("⏭  --skip-tts: mevcut ses kullanılıyor, zamanlama yeniden hesaplanıyor...");
    const savedCaptions = JSON.parse(fs.readFileSync(captionsAbsPath, "utf-8")) as {
      text: string; startMs: number; endMs: number;
    }[];
    wordTimings = captionsToWordTimings(savedCaptions);
    const last = wordTimings[wordTimings.length - 1];
    totalSec = last ? last.endSec + 0.3 : 10;
  } else if (script.audioFile) {
    // BYO mode — use Whisper for word timings
    console.log("🎙 BYO ses modu: Whisper ile kelime hizalama...");
    const { transcribeAudio } = await import("./whisperAlign");
    const result = await transcribeAudio(script.audioFile);
    wordTimings = result.wordTimings;
    totalSec = result.totalSec;
    fs.copyFileSync(script.audioFile, audioAbsPath);
  } else {
    // ElevenLabs TTS mode
    const vid = options.voiceId ?? script.meta.voiceId;
    if (!vid) {
      throw new Error(
        "voiceId belirtilmemiş. script.json içinde meta.voiceId ekleyin veya --voice ile geçin.",
      );
    }
    console.log("🔊 ElevenLabs TTS üretiliyor...");
    const alignment = await generateSpeechWithTimestamps(script.narration, vid, audioAbsPath);
    wordTimings = alignmentToWordTimings(alignment);
    const lastWord = wordTimings[wordTimings.length - 1];
    totalSec = lastWord ? lastWord.endSec + 0.3 : 10;

    // Always (re)write captions when TTS runs
    const captions = wordTimingsToCaptions(wordTimings);
    fs.writeFileSync(captionsAbsPath, JSON.stringify(captions, null, 2));
  }

  // (Re)write captions for BYO/skip-tts too if not already written
  if (!fs.existsSync(captionsAbsPath) || !options.skipTts) {
    if (!options.skipTts) {
      const captions = wordTimingsToCaptions(wordTimings);
      fs.writeFileSync(captionsAbsPath, JSON.stringify(captions, null, 2));
    }
  }

  // Always recompute timeline so stepHighlights are fresh
  const bg = script.background ?? { type: "gradient" as const };
  const timeline = buildTimeline(script, wordTimings, totalSec, bg);

  if (timeline.warnings.length > 0) {
    console.warn("⚠️  Zamanlama uyarıları:");
    timeline.warnings.forEach((w) => console.warn("   -", w));
  }

  // Save full timeline for reference
  const timelinePath = path.join(path.dirname(scriptPath), `${slug}-timeline.json`);
  fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2));
  console.log(`✅ Zamanlama: ${timeline.scenes.length} sahne, ${totalSec.toFixed(1)}s`);

  return { audioPublicPath, captionsPublicPath, timelinePath, timeline, totalSec };
}
