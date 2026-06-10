import path from "path";
import fs from "fs";
import { execFileSync } from "child_process";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import { WHISPER_VERSION, WHISPER_MODEL } from "../config";
import type { WordTiming } from "../tts/wordTimings";

const WHISPER_DIR = path.join(process.cwd(), "whisper.cpp");

export async function transcribeAudio(
  audioPath: string,
): Promise<{ wordTimings: WordTiming[]; totalSec: number }> {
  // Ensure whisper.cpp is installed
  await installWhisperCpp({ to: WHISPER_DIR, version: WHISPER_VERSION });
  await downloadWhisperModel({ model: WHISPER_MODEL, folder: WHISPER_DIR });

  // Convert to 16kHz wav (required by whisper)
  const wavPath = audioPath.replace(/\.[^.]+$/, "_16k.wav");
  execFileSync("ffmpeg", [
    "-i", audioPath,
    "-ar", "16000",
    "-ac", "1",
    wavPath,
    "-y",
  ]);

  const whisperOutput = await transcribe({
    model: WHISPER_MODEL,
    whisperPath: WHISPER_DIR,
    whisperCppVersion: WHISPER_VERSION,
    inputPath: wavPath,
    tokenLevelTimestamps: true,
  });

  const { captions } = toCaptions({ whisperCppOutput: whisperOutput });

  // Convert @remotion/captions Caption[] to WordTiming[]
  const wordTimings: WordTiming[] = captions.map((c) => ({
    word: c.text.trim(),
    startSec: c.startMs / 1000,
    endSec: c.endMs / 1000,
  }));

  const totalSec = wordTimings.length > 0
    ? wordTimings[wordTimings.length - 1].endSec + 0.3
    : 10;

  // Cleanup temp wav
  fs.unlinkSync(wavPath);

  return { wordTimings, totalSec };
}
