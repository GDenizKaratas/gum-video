import type { ElevenLabsAlignment } from "./elevenlabs";
import type { Caption } from "@remotion/captions";

export type WordTiming = {
  word: string;
  startSec: number;
  endSec: number;
};

const WORD_PUNCTUATION_RE = /["""''.,!?;:()[\]…–—]/g;

function normalizeForMatch(s: string): string {
  // Map Turkish uppercase letters BEFORE lowercasing — JS .toLowerCase() turns
  // "İ" into "i̇" (i + combining dot) and "I" into "i" (should be "ı"), which
  // breaks case-insensitive matching for words like "İkinci"/"Birinci".
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/Ş/g, "ş")
    .replace(/Ğ/g, "ğ")
    .replace(/Ç/g, "ç")
    .replace(/Ö/g, "ö")
    .replace(/Ü/g, "ü")
    .toLowerCase()
    .replace(/[^a-z0-9ışğçöü]/g, "");
}

export function alignmentToWordTimings(
  alignment: ElevenLabsAlignment,
): WordTiming[] {
  const { characters, character_start_times_seconds, character_end_times_seconds } =
    alignment;

  const words: WordTiming[] = [];
  let wordStart: number | null = null;
  let wordChars: string[] = [];

  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i];
    const isSpace = ch === " " || ch === "\n" || ch === "\r";

    if (!isSpace) {
      if (wordStart === null) wordStart = character_start_times_seconds[i];
      wordChars.push(ch);
    } else {
      if (wordStart !== null && wordChars.length > 0) {
        const raw = wordChars.join("");
        const clean = raw.replace(WORD_PUNCTUATION_RE, "");
        if (clean.length > 0) {
          words.push({
            word: clean,
            startSec: wordStart,
            endSec: character_end_times_seconds[i - 1],
          });
        }
        wordStart = null;
        wordChars = [];
      }
    }
  }

  // flush last word
  if (wordStart !== null && wordChars.length > 0) {
    const raw = wordChars.join("");
    const clean = raw.replace(WORD_PUNCTUATION_RE, "");
    if (clean.length > 0) {
      words.push({
        word: clean,
        startSec: wordStart,
        endSec: character_end_times_seconds[characters.length - 1],
      });
    }
  }

  return words;
}

export function wordTimingsToCaptions(timings: WordTiming[]): Caption[] {
  return timings.map((w) => ({
    text: " " + w.word,
    startMs: Math.round(w.startSec * 1000),
    endMs: Math.round(w.endSec * 1000),
    timestampMs: Math.round(w.startSec * 1000),
    confidence: null,
  }));
}

export function captionsToWordTimings(captions: { text: string; startMs: number; endMs: number }[]): WordTiming[] {
  return captions.map((c) => ({
    word: c.text.trim(),
    startSec: c.startMs / 1000,
    endSec: c.endMs / 1000,
  })).filter((w) => w.word.length > 0);
}

export function findWordTimeSec(
  timings: WordTiming[],
  word: string,
  occurrence = 1,
): number | null {
  const target = normalizeForMatch(word);
  let count = 0;
  for (const t of timings) {
    if (normalizeForMatch(t.word) === target) {
      count++;
      if (count === occurrence) return t.startSec;
    }
  }
  return null;
}
