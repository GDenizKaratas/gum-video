import type { WordTiming } from "../tts/wordTimings";

// A scene suggestion in the panel's shape (without the client-side id).
export type SuggestedScene = {
  type: "hook" | "title" | "flow" | "list" | "stat";
  afterWord: string;
  occurrence: number;
  position: "top" | "center" | "bottom";
  text?: string;
  title?: string;
  subtitle?: string;
  steps?: string[];
  highlightOn?: { afterWord: string; occurrence: number; stepIndex: number }[];
  items?: string[];
  header?: string;
  revealOn?: { afterWord: string; occurrence: number; itemIndex: number }[];
  revealMode?: "cumulative" | "sequential";
  value?: string;
  label?: string;
};

const trLower = (s: string) => s.toLocaleLowerCase("tr");

// word (lowercased, punctuation already stripped by alignment) -> ordinal number
const ORDINALS: Record<string, number> = {
  ilk: 1,
  birinci: 1,
  "1": 1,
  ikinci: 2,
  "2": 2,
  üçüncü: 3,
  uçuncu: 3,
  "3": 3,
  dördüncü: 4,
  dorduncu: 4,
  "4": 4,
  beşinci: 5,
  besinci: 5,
  "5": 5,
  altıncı: 6,
  altinci: 6,
  "6": 6,
  yedinci: 7,
  "7": 7,
};

// Filler words that follow an ordinal and shouldn't be part of the label
const FILLERS = new Set([
  "adım",
  "adımı",
  "adımda",
  "adımımız",
  "aşama",
  "aşaması",
  "aşamada",
  "madde",
  "maddesi",
  "kural",
  "kuralı",
  "neden",
  "sebep",
  "olarak",
  "ise",
  "de",
  "da",
  "ki",
]);

function occurrenceUpTo(words: WordTiming[], index: number): number {
  const target = trLower(words[index].word);
  let n = 0;
  for (let i = 0; i <= index; i++) {
    if (trLower(words[i].word) === target) n++;
  }
  return n;
}

function titleCase(words: string[]): string {
  return words
    .map((w) => (w.length ? w[0].toLocaleUpperCase("tr") + w.slice(1) : w))
    .join(" ");
}

/**
 * Heuristic scene suggestions from a Turkish narration + its word timings.
 * Detects an opening hook and an ordinal sequence ("Birinci… İkinci…") which
 * becomes a flow (if "adım"/"aşama" present) or list scene with per-item triggers.
 */
export function suggestScenes(
  narration: string,
  words: WordTiming[],
): SuggestedScene[] {
  const scenes: SuggestedScene[] = [];
  if (words.length === 0) return scenes;

  // 1) Hook — first sentence (cut at first . ? ! or ~12 words)
  const firstSentenceMatch = narration.trim().match(/^[^.?!]*[.?!]?/);
  let hookText = (firstSentenceMatch?.[0] ?? "").trim();
  if (hookText.split(/\s+/).length > 14) {
    hookText = hookText.split(/\s+/).slice(0, 12).join(" ") + "…";
  }
  if (hookText) {
    scenes.push({
      type: "hook",
      text: hookText,
      afterWord: words[0].word,
      occurrence: 1,
      position: "center",
    });
  }

  // 2) Ordinal sequence detection
  type Ord = { num: number; index: number };
  const ords: Ord[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < words.length; i++) {
    const n = ORDINALS[trLower(words[i].word)];
    // Take each ordinal number only once (first occurrence), in order 1,2,3…
    if (n && !seen.has(n) && (ords.length === 0 || n === ords[ords.length - 1].num + 1)) {
      ords.push({ num: n, index: i });
      seen.add(n);
    }
  }

  if (ords.length >= 2) {
    const usesAdim = ords.some((o) => {
      const next = words[o.index + 1];
      return next && (trLower(next.word).startsWith("adım") || trLower(next.word).startsWith("aşama"));
    });

    const labels: string[] = [];
    const triggers: { afterWord: string; occurrence: number; idx: number }[] = [];

    ords.forEach((o, oi) => {
      const end = oi + 1 < ords.length ? ords[oi + 1].index : Math.min(o.index + 5, words.length);
      const chunk: string[] = [];
      for (let i = o.index + 1; i < end && chunk.length < 3; i++) {
        const w = trLower(words[i].word);
        if (chunk.length === 0 && FILLERS.has(w)) continue; // skip leading filler
        chunk.push(words[i].word);
      }
      labels.push(titleCase(chunk.length ? chunk : [`Adım ${o.num}`]));
      triggers.push({
        afterWord: words[o.index].word,
        occurrence: occurrenceUpTo(words, o.index),
        idx: oi,
      });
    });

    const firstTrigger = triggers[0];
    if (usesAdim) {
      scenes.push({
        type: "flow",
        afterWord: firstTrigger.afterWord,
        occurrence: firstTrigger.occurrence,
        position: "center",
        steps: labels,
        highlightOn: triggers.map((t) => ({
          afterWord: t.afterWord,
          occurrence: t.occurrence,
          stepIndex: t.idx,
        })),
      });
    } else {
      scenes.push({
        type: "list",
        afterWord: firstTrigger.afterWord,
        occurrence: firstTrigger.occurrence,
        position: "center",
        items: labels,
        revealMode: "cumulative",
        revealOn: triggers.map((t) => ({
          afterWord: t.afterWord,
          occurrence: t.occurrence,
          itemIndex: t.idx,
        })),
      });
    }
  }

  return scenes;
}
