export const FPS = 30;

export const DIMENSIONS = {
  vertical: { width: 1080, height: 1920 },
  horizontal: { width: 1920, height: 1080 },
} as const;

export type Orientation = keyof typeof DIMENSIONS;

export const DEFAULT_ORIENTATION: Orientation = "vertical";

export const ELEVENLABS_MODEL = "eleven_multilingual_v2";

export const WHISPER_VERSION = "1.5.5";
export const WHISPER_MODEL = "medium";
