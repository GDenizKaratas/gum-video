import express, { type Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { execFileSync, spawn } from "child_process";
import { randomUUID } from "crypto";
import "dotenv/config";

import { ScriptSchema, type Script } from "../schema";
import { generateSpeechWithTimestamps } from "../tts/elevenlabs";
import { toSpokenTr } from "../tts/spoken";
import {
  alignmentToWordTimings,
  captionsToWordTimings,
  wordTimingsToCaptions,
  type WordTiming,
} from "../tts/wordTimings";
import { buildTimeline, type BackgroundConfig } from "../tts/align";
import { suggestScenes } from "../suggest/scenes";
import { BROLL_PROXY_DIR, withBrollProxies } from "../media/brollProxy";
import { registerPhotoRoutes } from "./photoRoutes";
import {
  getNumberedRenderOutputFileName,
  getRenderOutputFile,
  getRenderOutputRelativePath,
  getRenderOutputUrl,
} from "../outputPaths";

const PORT = Number(process.env.PANEL_PORT ?? 4005);
const ROOT = process.cwd();
const publicDir = path.join(ROOT, "public");
const outputDir = path.join(ROOT, "output");
const captionsDir = path.join(publicDir, "captions");
const audioDir = path.join(publicDir, "audio");

// Single working slug for panel sessions — audio/captions are reused across edits
const DRAFT_SLUG = "draft";

fs.mkdirSync(captionsDir, { recursive: true });
fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
// Drop background videos here to use them as scene/global backgrounds
fs.mkdirSync(path.join(publicDir, "broll"), { recursive: true });
// Drop photos here to use them as backgrounds or centered image scenes
fs.mkdirSync(path.join(publicDir, "images"), { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve rendered videos + project public assets (audio, captions, logo, fonts)
app.use("/output", express.static(outputDir));
app.use("/public", express.static(publicDir));

type StoredCaption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number | null;
};

type RenderStage = "queued" | "bundling" | "preparing" | "rendering" | "encoding" | "done" | "error";

type RenderJobEvent = {
  jobId: string;
  stage: RenderStage;
  progress: number;
  message: string;
  fileName?: string;
  url?: string;
  error?: string;
};

type RenderJob = RenderJobEvent & {
  propsPath: string;
  listeners: Set<Response>;
  outputBuffer: string;
};

const renderJobs = new Map<string, RenderJob>();

function captionsPath(slug: string) {
  return path.join(captionsDir, `${slug}.json`);
}
function audioPath(slug: string) {
  return path.join(audioDir, `${slug}.mp3`);
}

// Turkish-aware slug from the video title; used to name audio/captions/output
function slugify(title?: string): string {
  const s = (title ?? "")
    .replace(/[İIı]/g, "i")
    .replace(/[Şş]/g, "s")
    .replace(/[Ğğ]/g, "g")
    .replace(/[Çç]/g, "c")
    .replace(/[Öö]/g, "o")
    .replace(/[Üü]/g, "u")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || DRAFT_SLUG;
}

function getPublicRenderJob(job: RenderJob): RenderJobEvent {
  const { jobId, stage, progress, message, fileName, url, error } = job;
  return { jobId, stage, progress, message, fileName, url, error };
}

function emitRenderJob(job: RenderJob) {
  const payload = JSON.stringify(getPublicRenderJob(job));
  for (const listener of job.listeners) {
    listener.write(`data: ${payload}\n\n`);
  }
}

function updateRenderJob(job: RenderJob, patch: Partial<RenderJobEvent>) {
  Object.assign(job, patch);
  job.progress = Math.max(0, Math.min(100, Math.round(job.progress)));
  emitRenderJob(job);
}

function parseRenderLine(job: RenderJob, rawLine: string) {
  const line = rawLine.trim();
  if (!line) return;

  const bundling = line.match(/^Bundling\s+(\d+(?:\.\d+)?)%/);
  if (bundling) {
    updateRenderJob(job, {
      stage: "bundling",
      progress: Number(bundling[1]) * 0.1,
      message: line,
    });
    return;
  }

  if (line.includes("Getting composition")) {
    updateRenderJob(job, {
      stage: "preparing",
      progress: Math.max(job.progress, 10),
      message: line,
    });
    return;
  }

  const rendered = line.match(/^Rendered\s+(\d+)\/(\d+)/);
  if (rendered) {
    const done = Number(rendered[1]);
    const total = Math.max(1, Number(rendered[2]));
    updateRenderJob(job, {
      stage: "rendering",
      progress: 10 + (done / total) * 75,
      message: line,
    });
    return;
  }

  const encoded = line.match(/^Encoded\s+(\d+)\/(\d+)/);
  if (encoded) {
    const done = Number(encoded[1]);
    const total = Math.max(1, Number(encoded[2]));
    updateRenderJob(job, {
      stage: "encoding",
      progress: 85 + (done / total) * 15,
      message: line,
    });
    return;
  }

  if (/^(Composition|Codec|Output|Concurrency)\b/.test(line)) {
    updateRenderJob(job, {
      message: line,
    });
  }
}

function consumeRenderOutput(job: RenderJob, chunk: Buffer) {
  job.outputBuffer += chunk.toString("utf-8");
  const lines = job.outputBuffer.split(/\r?\n|\r/g);
  job.outputBuffer = lines.pop() ?? "";
  lines.forEach((line) => parseRenderLine(job, line));
}

function loadWords(slug: string): WordTiming[] {
  const p = captionsPath(slug);
  if (!fs.existsSync(p)) {
    throw new Error("Ses henüz oluşturulmadı. Önce 'Sesi Oluştur'a basın.");
  }
  const captions = JSON.parse(fs.readFileSync(p, "utf-8")) as StoredCaption[];
  return captionsToWordTimings(captions);
}

function loadCaptions(slug: string): StoredCaption[] {
  const p = captionsPath(slug);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8")) as StoredCaption[];
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Social-media (photo) pipeline — isolated routes + static, video untouched
registerPhotoRoutes(app);

const thumbsDir = path.join(publicDir, "_thumbs");
fs.mkdirSync(thumbsDir, { recursive: true });

// Generate a poster thumbnail for each video (macOS QuickLook), cached on disk.
// Returns a map of video-relpath -> thumbnail public path (or null if unavailable).
function ensureThumbnails(videos: string[]): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  const toGenerate: string[] = [];

  for (const rel of videos) {
    const base = path.basename(rel);
    const thumbAbs = path.join(thumbsDir, `${base}.png`);
    if (fs.existsSync(thumbAbs)) {
      result[rel] = `_thumbs/${base}.png`;
    } else {
      result[rel] = null;
      toGenerate.push(rel);
    }
  }

  if (toGenerate.length > 0 && process.platform === "darwin") {
    try {
      execFileSync(
        "qlmanage",
        ["-t", "-s", "320", "-o", thumbsDir, ...toGenerate.map((r) => path.join(publicDir, r))],
        { stdio: "ignore", timeout: 120000 },
      );
      for (const rel of toGenerate) {
        const base = path.basename(rel);
        if (fs.existsSync(path.join(thumbsDir, `${base}.png`))) {
          result[rel] = `_thumbs/${base}.png`;
        }
      }
    } catch {
      // QuickLook may fail for some files — leave those without a thumbnail
    }
  }

  return result;
}

// List background video files available under public/ (recursively, shallow)
app.get("/api/assets", (_req, res) => {
  const exts = [".mp4", ".webm", ".mov"];
  const found: string[] = [];
  const scan = (dir: string, prefix: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "_thumbs") continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (
          entry.name === "audio" ||
          entry.name === "captions" ||
          entry.name === BROLL_PROXY_DIR
        )
          continue;
        scan(path.join(dir, entry.name), rel);
      } else if (exts.includes(path.extname(entry.name).toLowerCase())) {
        found.push(rel);
      }
    }
  };
  scan(publicDir, "");
  found.sort();

  const thumbs = ensureThumbnails(found);

  // Images live under public/images — the image itself is its own thumbnail
  const imgExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const imagesDir = path.join(publicDir, "images");
  const images: { file: string; thumb: string }[] = [];
  if (fs.existsSync(imagesDir)) {
    for (const name of fs.readdirSync(imagesDir).sort()) {
      if (name.startsWith(".")) continue;
      if (imgExts.includes(path.extname(name).toLowerCase())) {
        images.push({ file: `images/${name}`, thumb: `images/${name}` });
      }
    }
  }

  res.json({
    videos: found.map((file) => ({ file, thumb: thumbs[file] ?? null })),
    images,
  });
});

// Returns whether a draft (audio + captions) exists for a slug, and the word list
app.get("/api/draft", (req, res) => {
  const slug = slugify(String(req.query.slug ?? "") || DRAFT_SLUG);
  if (!fs.existsSync(audioPath(slug)) || !fs.existsSync(captionsPath(slug))) {
    res.json({ exists: false });
    return;
  }
  const captions = loadCaptions(slug);
  const words = captionsToWordTimings(captions);
  res.json({
    exists: true,
    slug,
    audioPublicPath: `audio/${slug}.mp3`,
    captionsPublicPath: `captions/${slug}.json`,
    words,
    captions,
  });
});

// Generate speech (ElevenLabs) + word timings, store by title slug
app.post("/api/tts", async (req, res) => {
  try {
    const { narration, voiceId, title } = req.body as {
      narration?: string;
      voiceId?: string;
      title?: string;
    };
    if (!narration || !narration.trim()) {
      res.status(400).json({ error: "narration boş olamaz." });
      return;
    }
    if (!voiceId) {
      res.status(400).json({ error: "voiceId gerekli." });
      return;
    }

    const slug = slugify(title);
    const alignment = await generateSpeechWithTimestamps(toSpokenTr(narration), voiceId, audioPath(slug));
    const words = alignmentToWordTimings(alignment);
    const captions = wordTimingsToCaptions(words);
    fs.writeFileSync(captionsPath(slug), JSON.stringify(captions, null, 2));

    res.json({
      slug,
      audioPublicPath: `audio/${slug}.mp3`,
      captionsPublicPath: `captions/${slug}.json`,
      words,
      captions,
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// Heuristic scene suggestions from the narration + word timings
app.post("/api/suggest-scenes", (req, res) => {
  try {
    const { narration, title } = req.body as { narration?: string; title?: string };
    const words = loadWords(slugify(title));
    const scenes = suggestScenes(narration ?? "", words);
    res.json({ scenes });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// Build a timeline from the current panel config (using the title's audio)
app.post("/api/timeline", (req, res) => {
  try {
    const config = req.body as unknown;
    const script: Script = ScriptSchema.parse(config);
    const slug = slugify(script.meta.title);
    const words = loadWords(slug);
    const last = words[words.length - 1];
    const totalSec = last ? last.endSec + 0.3 : 10;
    const bg: BackgroundConfig = script.background ?? { type: "gradient" };
    const timeline = withBrollProxies(
      buildTimeline(script, words, totalSec, bg),
      publicDir,
    );
    const captions = loadCaptions(slug);
    res.json({
      timeline,
      captions,
      audioPublicPath: `audio/${slug}.mp3`,
      captionsPublicPath: `captions/${slug}.json`,
    });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

app.get("/api/render/:jobId/events", (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Render işi bulunamadı." });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  res.write(`data: ${JSON.stringify(getPublicRenderJob(job))}\n\n`);

  job.listeners.add(res);
  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    job.listeners.delete(res);
  });
});

// Render the final mp4
app.post("/api/render", (req, res) => {
  try {
    const body = req.body as { displayCaptions?: unknown };
    const script: Script = ScriptSchema.parse(body);
    const slug = slugify(script.meta.title);
    const words = loadWords(slug);
    const last = words[words.length - 1];
    const totalSec = last ? last.endSec + 0.3 : 10;
    const bg: BackgroundConfig = script.background ?? { type: "gradient" };
    const timeline = withBrollProxies(
      buildTimeline(script, words, totalSec, bg),
      publicDir,
    );

    // Optional edited caption display text (timing untouched) from the panel
    const displayCaptions = Array.isArray(body.displayCaptions) ? body.displayCaptions : undefined;

    const orientation = script.meta.orientation ?? "vertical";

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    const baseFileName = `${slug}-${dateStr}-${timeStr}.mp4`;
    const fileName = getNumberedRenderOutputFileName(ROOT, orientation, baseFileName);
    const outFile = getRenderOutputFile(ROOT, orientation, fileName);
    const outputRelativePath = getRenderOutputRelativePath(orientation, fileName);
    const outputUrl = getRenderOutputUrl(orientation, fileName);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });

    const inputProps = {
      audioPublicPath: `audio/${slug}.mp3`,
      captionsPublicPath: `captions/${slug}.json`,
      timeline,
      orientation,
      ...(displayCaptions ? { captions: displayCaptions } : {}),
    };

    // Write props to a temp file (avoids huge CLI args)
    const jobId = randomUUID();
    const propsPath = path.join(outputDir, `.props-${jobId}.json`);
    fs.writeFileSync(propsPath, JSON.stringify(inputProps));

    const job: RenderJob = {
      jobId,
      stage: "queued",
      progress: 0,
      message: "Render kuyruğa alındı.",
      fileName: outputRelativePath,
      url: outputUrl,
      propsPath,
      listeners: new Set(),
      outputBuffer: "",
    };
    renderJobs.set(jobId, job);

    const child = spawn(
      "npx",
      [
        "remotion",
        "render",
        "VideoComposition",
        outFile,
        `--props=${propsPath}`,
      ],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] },
    );

    child.stdout.on("data", (chunk: Buffer) => consumeRenderOutput(job, chunk));
    child.stderr.on("data", (chunk: Buffer) => consumeRenderOutput(job, chunk));
    child.on("error", (error) => {
      fs.rmSync(propsPath, { force: true });
      updateRenderJob(job, {
        stage: "error",
        progress: job.progress,
        message: error.message,
        error: error.message,
      });
    });
    child.on("close", (code) => {
      parseRenderLine(job, job.outputBuffer);
      job.outputBuffer = "";
      fs.rmSync(propsPath, { force: true });
      if (code === 0) {
        updateRenderJob(job, {
          stage: "done",
          progress: 100,
          message: "Render tamamlandı.",
          fileName: outputRelativePath,
          url: outputUrl,
        });
      } else {
        const error = `Render başarısız oldu (exit code ${code ?? "bilinmiyor"}).`;
        updateRenderJob(job, {
          stage: "error",
          progress: job.progress,
          message: error,
          error,
        });
      }

      setTimeout(() => renderJobs.delete(jobId), 10 * 60 * 1000);
    });

    res.json({
      ok: true,
      jobId,
      fileName: outputRelativePath,
      url: outputUrl,
      warnings: timeline.warnings,
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`🎛  Panel API çalışıyor → http://localhost:${PORT}`);
});
