import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { ScriptSchema } from "../schema";
import { BROLL_DIR, BROLL_PROXY_DIR } from "../media/brollProxy";

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm"]);

type FfmpegCommand = {
  bin: string;
  env: NodeJS.ProcessEnv;
};

type Options = {
  force: boolean;
  scriptPath?: string;
  maxWidth: number;
  maxHeight: number;
  fps: number;
  crf: number;
  preset: string;
};

function parseOptions(args: string[]): Options {
  const readNumber = (name: string, fallback: number) => {
    const value = args.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
    if (!value) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    force: args.includes("--force"),
    scriptPath: args.find((arg) => arg.startsWith("--script="))?.split("=")[1],
    maxWidth: readNumber("width", 1920),
    maxHeight: readNumber("height", 1080),
    fps: readNumber("fps", 30),
    crf: readNumber("crf", 23),
    preset: args.find((arg) => arg.startsWith("--preset="))?.split("=")[1] ?? "veryfast",
  };
}

function isVideoFile(filePath: string) {
  return VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function findVideos(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findVideos(absPath));
    } else if (entry.isFile() && isVideoFile(entry.name)) {
      found.push(absPath);
    }
  }

  return found.sort();
}

function addBackgroundVideo(
  files: Set<string>,
  bg: { type: string; videoFile?: string } | undefined,
) {
  if (bg?.type === "video" && bg.videoFile?.startsWith(`${BROLL_DIR}/`)) {
    files.add(bg.videoFile.slice(`${BROLL_DIR}/`.length));
  }
}

function getScriptBrollFiles(scriptPath: string): Set<string> {
  const raw = JSON.parse(fs.readFileSync(scriptPath, "utf-8")) as unknown;
  const script = ScriptSchema.parse(raw);
  const files = new Set<string>();

  addBackgroundVideo(files, script.background);
  for (const scene of script.scenes) {
    addBackgroundVideo(files, scene.background);
    if (
      (scene.type === "video" || scene.type === "broll") &&
      scene.file?.startsWith(`${BROLL_DIR}/`)
    ) {
      files.add(scene.file.slice(`${BROLL_DIR}/`.length));
    }
  }

  return files;
}

function findExecutableInPath(name: string) {
  const paths = (process.env.PATH ?? "").split(path.delimiter);
  for (const dir of paths) {
    const candidate = path.join(dir, name);
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function findRemotionFfmpeg(root: string) {
  const remotionDir = path.join(root, "node_modules", "@remotion");
  if (!fs.existsSync(remotionDir)) return null;

  const prefix = `compositor-${process.platform}-${process.arch}`;
  for (const entry of fs.readdirSync(remotionDir)) {
    if (!entry.startsWith(prefix)) continue;
    const candidate = path.join(remotionDir, entry, "ffmpeg");
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function resolveFfmpeg(root: string): FfmpegCommand {
  const explicit = process.env.FFMPEG_PATH;
  const bin = explicit || findExecutableInPath("ffmpeg") || findRemotionFfmpeg(root);

  if (!bin) {
    throw new Error(
      "ffmpeg bulunamadı. Sisteme ffmpeg kurun veya FFMPEG_PATH=/path/to/ffmpeg ile çalıştırın.",
    );
  }

  const env = { ...process.env };
  const libDir = path.dirname(bin);
  const libKey = process.platform === "darwin" ? "DYLD_LIBRARY_PATH" : "LD_LIBRARY_PATH";
  env[libKey] = [libDir, env[libKey]].filter(Boolean).join(path.delimiter);

  return { bin, env };
}

function shouldSkip(input: string, output: string, force: boolean) {
  if (force || !fs.existsSync(output)) return false;
  return fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs;
}

function encodeProxy({
  ffmpeg,
  input,
  output,
  options,
}: {
  ffmpeg: FfmpegCommand;
  input: string;
  output: string;
  options: Options;
}) {
  fs.mkdirSync(path.dirname(output), { recursive: true });

  const scaleFilter =
    `scale='min(${options.maxWidth},iw)':'min(${options.maxHeight},ih)'` +
    ":force_original_aspect_ratio=decrease";

  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-fflags",
    "+genpts",
    "-y",
    "-i",
    input,
    "-map",
    "0:v:0",
    "-an",
    "-vf",
    scaleFilter,
    "-r",
    String(options.fps),
    "-fps_mode",
    "cfr",
    "-c:v",
    "libx264",
    "-preset",
    options.preset,
    "-crf",
    String(options.crf),
    "-g",
    String(options.fps),
    "-keyint_min",
    String(options.fps),
    "-sc_threshold",
    "0",
    "-pix_fmt",
    "yuv420p",
    "-video_track_timescale",
    String(options.fps * 1000),
    "-movflags",
    "+faststart",
    output,
  ];

  const result = spawnSync(ffmpeg.bin, args, {
    stdio: "inherit",
    env: ffmpeg.env,
  });

  if (result.status !== 0) {
    throw new Error(`Proxy üretimi başarısız: ${input}`);
  }
}

function main() {
  const root = process.cwd();
  const options = parseOptions(process.argv.slice(2));
  const publicDir = path.join(root, "public");
  const sourceDir = path.join(publicDir, BROLL_DIR);
  const proxyDir = path.join(publicDir, BROLL_PROXY_DIR);

  const requestedFiles = options.scriptPath
    ? getScriptBrollFiles(path.resolve(options.scriptPath))
    : null;

  const inputFiles = findVideos(sourceDir).filter((input) => {
    if (!requestedFiles) return true;
    const rel = path.relative(sourceDir, input).split(path.sep).join("/");
    return requestedFiles.has(rel);
  });

  if (inputFiles.length === 0) {
    console.log("Proxy üretilecek b-roll videosu bulunamadı.");
    return;
  }

  const ffmpeg = resolveFfmpeg(root);
  console.log(`🎞  B-roll proxy: ${inputFiles.length} video`);
  console.log(`   Hedef: ${options.maxWidth}x${options.maxHeight}, ${options.fps}fps, CRF ${options.crf}`);
  console.log(`   Klasör: public/${BROLL_PROXY_DIR}`);

  let encoded = 0;
  let skipped = 0;
  for (const [index, input] of inputFiles.entries()) {
    const rel = path.relative(sourceDir, input);
    const output = path.join(proxyDir, rel).replace(/\.(mov|webm)$/i, ".mp4");
    const label = rel.split(path.sep).join("/");

    if (shouldSkip(input, output, options.force)) {
      skipped++;
      console.log(`⏭  [${index + 1}/${inputFiles.length}] ${label}`);
      continue;
    }

    console.log(`▶️  [${index + 1}/${inputFiles.length}] ${label}`);
    encodeProxy({ ffmpeg, input, output, options });
    encoded++;
  }

  console.log(`✅ Proxy hazır. Yeni: ${encoded}, atlanan: ${skipped}`);
}

try {
  main();
} catch (e) {
  console.error("❌", e instanceof Error ? e.message : e);
  process.exit(1);
}
