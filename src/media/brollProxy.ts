import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import type { BackgroundConfig, TimedScene, Timeline } from "../tts/align";
import type { SceneDef } from "../schema";
import { FPS } from "../config";

export const BROLL_DIR = "broll";
export const BROLL_PROXY_DIR = "broll-proxy";

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm"]);
const durationCache = new Map<string, number | undefined>();

type FfprobeCommand = {
  bin: string;
  env: NodeJS.ProcessEnv;
};

function normalizePublicPath(publicPath: string) {
  return publicPath.replace(/^\/+/, "").split(path.sep).join("/");
}

function isBrollVideo(publicPath: string) {
  const normalized = normalizePublicPath(publicPath);
  return (
    normalized.startsWith(`${BROLL_DIR}/`) &&
    VIDEO_EXTENSIONS.has(path.extname(normalized).toLowerCase())
  );
}

function findExecutableInPath(name: string) {
  const paths = (process.env.PATH ?? "").split(path.delimiter);
  for (const dir of paths) {
    const candidate = path.join(dir, name);
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function findRemotionFfprobe(root: string) {
  const remotionDir = path.join(root, "node_modules", "@remotion");
  if (!fs.existsSync(remotionDir)) return null;

  const prefix = `compositor-${process.platform}-${process.arch}`;
  for (const entry of fs.readdirSync(remotionDir)) {
    if (!entry.startsWith(prefix)) continue;
    const candidate = path.join(remotionDir, entry, "ffprobe");
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function resolveFfprobe(publicDir: string): FfprobeCommand | null {
  const root = path.dirname(publicDir);
  const explicit = process.env.FFPROBE_PATH;
  const bin = explicit || findExecutableInPath("ffprobe") || findRemotionFfprobe(root);

  if (!bin) return null;

  const env = { ...process.env };
  const libDir = path.dirname(bin);
  const libKey = process.platform === "darwin" ? "DYLD_LIBRARY_PATH" : "LD_LIBRARY_PATH";
  env[libKey] = [libDir, env[libKey]].filter(Boolean).join(path.delimiter);

  return { bin, env };
}

function getVideoDurationInFrames(publicPath: string, publicDir: string) {
  const normalized = normalizePublicPath(publicPath);
  const absPath = path.join(publicDir, normalized);

  if (durationCache.has(absPath)) {
    return durationCache.get(absPath);
  }

  if (!fs.existsSync(absPath)) {
    durationCache.set(absPath, undefined);
    return undefined;
  }

  const ffprobe = resolveFfprobe(publicDir);
  if (!ffprobe) {
    durationCache.set(absPath, undefined);
    return undefined;
  }

  try {
    const output = execFileSync(
      ffprobe.bin,
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=duration:format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        absPath,
      ],
      { encoding: "utf-8", env: ffprobe.env },
    );
    const seconds = output
      .trim()
      .split(/\s+/)
      .map((value) => Number(value))
      .find((value) => Number.isFinite(value) && value > 0);
    const durationInFrames =
      seconds === undefined ? undefined : Math.max(1, Math.round(seconds * FPS));

    durationCache.set(absPath, durationInFrames);
    return durationInFrames;
  } catch {
    durationCache.set(absPath, undefined);
    return undefined;
  }
}

export function getBrollProxyPublicPath(publicPath: string, publicDir: string) {
  const normalized = normalizePublicPath(publicPath);
  if (!isBrollVideo(normalized)) return publicPath;

  const relativeToBroll = normalized.slice(`${BROLL_DIR}/`.length);
  const proxyPath = `${BROLL_PROXY_DIR}/${relativeToBroll}`;
  const proxyAbsPath = path.join(publicDir, proxyPath);
  const mp4ProxyPath = proxyPath.replace(/\.(mov|webm)$/i, ".mp4");

  if (fs.existsSync(proxyAbsPath)) return proxyPath;
  if (mp4ProxyPath !== proxyPath && fs.existsSync(path.join(publicDir, mp4ProxyPath))) {
    return mp4ProxyPath;
  }

  return publicPath;
}

function withProxyBackground(
  background: BackgroundConfig | undefined,
  publicDir: string,
) {
  if (!background || background.type !== "video" || !background.videoFile) {
    return background;
  }

  const videoFile = getBrollProxyPublicPath(background.videoFile, publicDir);
  const videoDurationInFrames =
    getVideoDurationInFrames(videoFile, publicDir) ?? background.videoDurationInFrames;

  if (
    videoFile === background.videoFile &&
    videoDurationInFrames === background.videoDurationInFrames
  ) {
    return background;
  }

  return {
    ...background,
    videoFile,
    videoDurationInFrames,
  };
}

function withProxyScene(scene: SceneDef, publicDir: string): SceneDef {
  if ((scene.type === "video" || scene.type === "broll") && scene.file) {
    const file = getBrollProxyPublicPath(scene.file, publicDir);
    if (file !== scene.file) {
      return {
        ...scene,
        file,
      };
    }
  }

  return scene;
}

function withProxyTimedScene(ts: TimedScene, publicDir: string): TimedScene {
  const scene = withProxyScene(ts.scene, publicDir);
  const background = withProxyBackground(ts.background, publicDir);

  if (scene === ts.scene && background === ts.background) return ts;

  return {
    ...ts,
    scene,
    background,
  };
}

export function withBrollProxies(timeline: Timeline, publicDir: string): Timeline {
  return {
    ...timeline,
    background:
      withProxyBackground(timeline.background, publicDir) ?? timeline.background,
    scenes: timeline.scenes.map((ts) => withProxyTimedScene(ts, publicDir)),
  };
}
