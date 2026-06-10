export type Orientation = "vertical" | "horizontal";

export type SceneBg = {
  type: "gradient" | "video" | "image";
  videoFile?: string;
  imageFile?: string;
  videoOpacity?: number;
};

export type FlowHighlight = {
  afterWord: string;
  occurrence: number;
  stepIndex: number;
};

export type ItemReveal = {
  afterWord: string;
  occurrence: number;
  itemIndex: number;
};

export type ScenePosition = "top" | "center" | "bottom";

export type SceneType = "hook" | "title" | "flow" | "list" | "stat" | "image" | "video";

export type Scene = {
  id: string;
  type: SceneType;
  afterWord: string;
  occurrence: number;
  position: ScenePosition;
  textBackdrop?: "none" | "shadow" | "plate";
  background?: SceneBg;
  // optional early end
  endAfterWord?: string;
  endOccurrence?: number;
  durationSec?: number;
  // type-specific
  text?: string; // hook
  title?: string; // title
  subtitle?: string; // title
  titleStyle?: "underline" | "band"; // title
  steps?: string[]; // flow
  highlightOn?: FlowHighlight[]; // flow
  items?: string[]; // list
  header?: string; // list
  layout?: "stack" | "grid"; // list
  headerStyle?: "underline" | "band" | "none"; // list
  numbered?: boolean; // list
  revealOn?: ItemReveal[]; // list
  revealMode?: "cumulative" | "sequential"; // list
  highlightColor?: "accent" | "danger" | "plain"; // list/flow
  value?: string; // stat
  label?: string; // stat
  file?: string; // image / video
  caption?: string; // image
  full?: boolean; // image
};

export type WordTiming = { word: string; startSec: number; endSec: number };

export type StoredCaption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number | null;
};

// Mirrors the server's ScriptSchema shape for one scene (no client id)
export function sceneToScript(s: Scene) {
  const base: Record<string, unknown> = {
    type: s.type,
    afterWord: s.afterWord,
    occurrence: s.occurrence,
    position: s.position ?? "center",
    textBackdrop: s.textBackdrop ?? "shadow",
  };
  if (s.background) base.background = s.background;
  if (s.endAfterWord) {
    base.endAfterWord = s.endAfterWord;
    base.endOccurrence = s.endOccurrence ?? 1;
  }
  if (s.durationSec) base.durationSec = s.durationSec;
  switch (s.type) {
    case "hook":
      base.text = s.text ?? "";
      break;
    case "title":
      base.title = s.title ?? "";
      if (s.subtitle) base.subtitle = s.subtitle;
      base.titleStyle = s.titleStyle ?? "underline";
      break;
    case "flow":
      base.steps = s.steps ?? [];
      if (s.highlightOn && s.highlightOn.length) base.highlightOn = s.highlightOn;
      base.highlightColor = s.highlightColor === "danger" ? "danger" : "accent";
      break;
    case "list":
      base.items = s.items ?? [];
      if (s.header) base.header = s.header;
      base.layout = s.layout ?? "stack";
      base.headerStyle = s.headerStyle ?? "underline";
      base.numbered = s.numbered ?? true;
      if (s.revealOn && s.revealOn.length) base.revealOn = s.revealOn;
      base.revealMode = s.revealMode ?? "cumulative";
      base.highlightColor = s.highlightColor ?? "accent";
      break;
    case "stat":
      base.value = s.value ?? "";
      base.label = s.label ?? "";
      break;
    case "image":
      base.file = s.file ?? "";
      if (s.caption) base.caption = s.caption;
      base.full = s.full ?? false;
      break;
    case "video":
      base.file = s.file ?? "";
      break;
  }
  return base;
}

const newId = () => Math.random().toString(36).slice(2, 9);

// Inverse of sceneToScript: a script.json scene → panel Scene (adds id, fills defaults)
export function scriptSceneToPanel(s: any): Scene {
  const sc: Scene = {
    id: newId(),
    type: (s.type ?? "title") as SceneType,
    afterWord: s.afterWord ?? "",
    occurrence: s.occurrence ?? 1,
    position: (s.position ?? "center") as ScenePosition,
    textBackdrop: s.textBackdrop ?? "shadow",
  };
  if (s.background) sc.background = s.background as SceneBg;
  if (s.endAfterWord) {
    sc.endAfterWord = s.endAfterWord;
    sc.endOccurrence = s.endOccurrence ?? 1;
  }
  if (typeof s.durationSec === "number") sc.durationSec = s.durationSec;
  switch (sc.type) {
    case "hook":
      sc.text = s.text ?? "";
      break;
    case "title":
      sc.title = s.title ?? "";
      sc.subtitle = s.subtitle;
      sc.titleStyle = s.titleStyle ?? "underline";
      break;
    case "flow":
      sc.steps = s.steps ?? ["", ""];
      sc.highlightColor = s.highlightColor === "danger" ? "danger" : "accent";
      sc.highlightOn = (s.highlightOn ?? []).map((h: any) => ({
        afterWord: h.afterWord ?? "",
        occurrence: h.occurrence ?? 1,
        stepIndex: h.stepIndex ?? 0,
      }));
      break;
    case "list":
      sc.items = s.items ?? [""];
      sc.header = s.header;
      sc.layout = s.layout ?? "stack";
      sc.headerStyle = s.headerStyle ?? "underline";
      sc.numbered = s.numbered ?? true;
      sc.revealMode = s.revealMode ?? "cumulative";
      sc.highlightColor = s.highlightColor ?? "accent";
      sc.revealOn = (s.revealOn ?? []).map((h: any) => ({
        afterWord: h.afterWord ?? "",
        occurrence: h.occurrence ?? 1,
        itemIndex: h.itemIndex ?? 0,
      }));
      break;
    case "stat":
      sc.value = s.value ?? "";
      sc.label = s.label ?? "";
      break;
    case "image":
      sc.file = s.file ?? "";
      sc.caption = s.caption;
      sc.full = s.full ?? false;
      break;
    case "video":
      sc.file = s.file ?? "";
      break;
  }
  return sc;
}
