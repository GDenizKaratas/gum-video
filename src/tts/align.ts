import type { Script, SceneDef } from "../schema";
import { findWordTimeSec, type WordTiming } from "./wordTimings";
import { FPS } from "../config";

export type BackgroundConfig = {
  type: "gradient" | "video" | "image";
  videoFile?: string;
  imageFile?: string;
  videoOpacity?: number;
  videoDurationInFrames?: number;
};

export type TimedScene = {
  scene: SceneDef;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
  // For flow scenes: which step should be highlighted and when (in frames)
  stepHighlights?: Array<{ stepIndex: number; fromFrame: number }>;
  // For list scenes: when each item should appear/light up (frames, scene-relative)
  itemHighlights?: Array<{ itemIndex: number; fromFrame: number }>;
  // Per-scene background override (overlays the global background)
  background?: BackgroundConfig;
};

export type Timeline = {
  totalSec: number;
  totalFrames: number;
  scenes: TimedScene[];
  warnings: string[];
  background: BackgroundConfig;
  // Manually highlighted word indices (into the spoken word list)
  highlightedWords: number[];
  // Karaoke effect: spoken word lights up in sync with audio
  captionKaraoke: boolean;
  // Whether captions are shown at all
  captionsEnabled: boolean;
  // Active theme preset id (default/ocean/emerald/sunset)
  themeId: string;
};

export function buildTimeline(
  script: Script,
  timings: WordTiming[],
  totalAudioSec: number,
  background?: BackgroundConfig,
): Timeline {
  const warnings: string[] = [];
  const timedScenes: Array<{ scene: SceneDef; startSec: number }> = [];

  // Hook always starts at 0
  if (script.hook) {
    const hookScene: SceneDef = {
      type: "hook",
      text: script.hook.text,
      style: script.hook.style ?? "bigText",
      afterWord: "",
      occurrence: 1,
      position: "center",
      textBackdrop: "shadow",
      endOccurrence: 1,
    };
    timedScenes.push({ scene: hookScene, startSec: 0 });
  }

  for (const scene of script.scenes) {
    if (!scene.afterWord) {
      warnings.push(`Sahne tipi "${scene.type}" için afterWord belirtilmemiş, atlanıyor.`);
      continue;
    }

    const startSec = findWordTimeSec(timings, scene.afterWord, scene.occurrence);
    if (startSec === null) {
      warnings.push(
        `"${scene.afterWord}" kelimesi (${scene.occurrence}. tekrar) metinde bulunamadı — sahne atlandı.`,
      );
      continue;
    }

    timedScenes.push({ scene, startSec });
  }

  // Sort by start time
  timedScenes.sort((a, b) => a.startSec - b.startSec);

  const result: TimedScene[] = timedScenes.map((ts, i) => {
    const next = timedScenes[i + 1];
    let endSec = next ? next.startSec : totalAudioSec;

    // Optional early end: scene can disappear before the next one starts
    if (ts.scene.endAfterWord) {
      const e = findWordTimeSec(timings, ts.scene.endAfterWord, ts.scene.endOccurrence ?? 1);
      if (e !== null && e > ts.startSec) endSec = Math.min(endSec, e);
      else if (e === null)
        warnings.push(`Sahne bitiş kelimesi "${ts.scene.endAfterWord}" bulunamadı.`);
    }
    if (ts.scene.durationSec) {
      endSec = Math.min(endSec, ts.startSec + ts.scene.durationSec);
    }

    const startFrame = Math.round(ts.startSec * FPS);
    const endFrame = Math.round(endSec * FPS);

    let stepHighlights: TimedScene["stepHighlights"];
    if (ts.scene.type === "flow" && ts.scene.highlightOn) {
      stepHighlights = ts.scene.highlightOn
        .map((h) => {
          const sec = findWordTimeSec(timings, h.afterWord, h.occurrence);
          if (sec === null) {
            warnings.push(`Flow highlight kelimesi "${h.afterWord}" bulunamadı.`);
            return null;
          }
          return {
            stepIndex: h.stepIndex,
            fromFrame: Math.round(sec * FPS) - startFrame,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
    }

    let itemHighlights: TimedScene["itemHighlights"];
    if (ts.scene.type === "list" && ts.scene.revealOn) {
      itemHighlights = ts.scene.revealOn
        .map((h) => {
          const sec = findWordTimeSec(timings, h.afterWord, h.occurrence);
          if (sec === null) {
            warnings.push(`Liste reveal kelimesi "${h.afterWord}" bulunamadı.`);
            return null;
          }
          return {
            itemIndex: h.itemIndex,
            fromFrame: Math.round(sec * FPS) - startFrame,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
    }

    const sceneBg = ts.scene.background
      ? {
          type: ts.scene.background.type,
          videoFile: ts.scene.background.videoFile,
          imageFile: ts.scene.background.imageFile,
          videoOpacity: ts.scene.background.videoOpacity,
        }
      : undefined;

    return {
      scene: ts.scene,
      startSec: ts.startSec,
      endSec,
      startFrame,
      endFrame,
      stepHighlights,
      itemHighlights,
      background: sceneBg,
    };
  });

  return {
    totalSec: totalAudioSec,
    totalFrames: Math.ceil(totalAudioSec * FPS),
    scenes: result,
    warnings,
    background: background ?? { type: "gradient" },
    highlightedWords: script.highlightedWords ?? [],
    captionKaraoke: script.captions?.karaoke ?? true,
    captionsEnabled: script.captions?.enabled ?? true,
    themeId: script.meta?.theme ?? "default",
  };
}
