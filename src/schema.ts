import { z } from "zod";

// Per-scene background override (falls back to global background when omitted)
const SceneBackground = z
  .object({
    type: z.enum(["gradient", "video", "image"]).default("gradient"),
    videoFile: z.string().optional(),
    imageFile: z.string().optional(),
    // Opacity of the video/image layer (low = dim with vignette, 1 = shown directly)
    videoOpacity: z.number().min(0).max(1).default(0.18),
  })
  .optional();

const WordTrigger = z.object({
  afterWord: z.string(),
  occurrence: z.number().int().min(1).default(1),
  background: SceneBackground,
  // Vertical placement of the scene content
  position: z.enum(["top", "center", "bottom"]).default("center"),
  // Readability backing for floating text (hook/title): none, soft shadow, or a panel
  textBackdrop: z.enum(["none", "shadow", "plate"]).default("shadow"),
  // Optional early end: scene disappears at this spoken word (else lasts until next scene)
  endAfterWord: z.string().optional(),
  endOccurrence: z.number().int().min(1).default(1),
  // Optional fixed duration in seconds (alternative to endAfterWord)
  durationSec: z.number().positive().optional(),
});

const FlowHighlight = z.object({
  afterWord: z.string(),
  occurrence: z.number().int().min(1).default(1),
  stepIndex: z.number().int().min(0),
});

// When a list item should appear/light up (word-triggered)
const ItemReveal = z.object({
  afterWord: z.string(),
  occurrence: z.number().int().min(1).default(1),
  itemIndex: z.number().int().min(0),
});

export const SceneSchema = z.discriminatedUnion("type", [
  WordTrigger.extend({
    type: z.literal("hook"),
    text: z.string(),
    style: z.enum(["bigText"]).default("bigText"),
  }),
  WordTrigger.extend({
    type: z.literal("title"),
    title: z.string(),
    subtitle: z.string().optional(),
    // underline = gold line under title · band = title sits on a primary-tinted bar
    titleStyle: z.enum(["underline", "band"]).default("underline"),
  }),
  WordTrigger.extend({
    type: z.literal("flow"),
    steps: z.array(z.string()).min(2),
    highlightOn: z.array(FlowHighlight).optional(),
    // accent (gold) or danger (red) for active step
    highlightColor: z.enum(["accent", "danger"]).default("accent"),
  }),
  WordTrigger.extend({
    type: z.literal("list"),
    items: z.array(z.string()).min(1),
    header: z.string().optional(),
    // stack = vertical list; grid = side-by-side cards filling the screen
    layout: z.enum(["stack", "grid"]).default("stack"),
    // header görünümü: alt çizgi / primary bant / düz
    headerStyle: z.enum(["underline", "band", "none"]).default("underline"),
    // maddelerde numara dairesi gösterilsin mi (false = nokta)
    numbered: z.boolean().default(true),
    // Reveal items one-by-one as words are spoken. Empty = all visible at once.
    revealOn: z.array(ItemReveal).optional(),
    // cumulative: revealed items stay active; sequential: only the latest is active
    revealMode: z.enum(["cumulative", "sequential"]).default("cumulative"),
    // accent: gold · danger: red (hatalar/uyarılar) · plain: white (bold only)
    highlightColor: z.enum(["accent", "danger", "plain"]).default("accent"),
  }),
  WordTrigger.extend({
    type: z.literal("stat"),
    value: z.string(),
    label: z.string(),
    emphasis: z.string().optional(),
    emphasisColor: z.enum(["accent", "danger", "plain"]).default("accent"),
  }),
  WordTrigger.extend({
    type: z.literal("image"),
    // Photo shown centered in the frame (relative to public/, e.g. "images/x.jpg")
    file: z.string(),
    caption: z.string().optional(),
    // full = cover the whole frame; otherwise centered rounded card
    full: z.boolean().default(false),
  }),
  WordTrigger.extend({
    type: z.literal("video"),
    // Full-screen video clip (relative to public/, e.g. "broll/x.mp4")
    file: z.string(),
  }),
  WordTrigger.extend({
    type: z.literal("broll"),
    file: z.string().optional(),
    durationSec: z.number().positive().optional(),
  }),
]);

export type SceneDef = z.infer<typeof SceneSchema>;

export const ScriptSchema = z.object({
  meta: z.object({
    title: z.string(),
    orientation: z.enum(["vertical", "horizontal"]).default("vertical"),
    voiceId: z.string().optional(),
    theme: z.string().default("default"),
  }),
  hook: z
    .object({
      text: z.string(),
      style: z.enum(["bigText"]).default("bigText"),
    })
    .optional(),
  narration: z.string().min(1),
  scenes: z.array(SceneSchema),
  // Manually chosen word indices (0-based, into the spoken word list) rendered
  // permanently in the accent (gold) color in captions. Set via the panel.
  highlightedWords: z.array(z.number().int().min(0)).default([]),
  captions: z
    .object({
      enabled: z.boolean().default(true),
      style: z.enum(["wordByWord"]).default("wordByWord"),
      // Karaoke: the currently-spoken word lights up in sync with the audio
      karaoke: z.boolean().default(true),
    })
    .default({ enabled: true, style: "wordByWord", karaoke: true }),
  broll: z
    .object({
      enabled: z.boolean().default(false),
      dir: z.string().default("assets/broll"),
    })
    .default({ enabled: false, dir: "assets/broll" }),
  // Set when using BYO audio instead of ElevenLabs TTS
  audioFile: z.string().optional(),
  // Global background for all scenes unless overridden per-scene
  background: z
    .object({
      type: z.enum(["gradient", "video", "image"]).default("gradient"),
      videoFile: z.string().optional(), // relative to public/, e.g. "broll/background.mp4"
      imageFile: z.string().optional(), // relative to public/, e.g. "images/bg.jpg"
      videoOpacity: z.number().min(0).max(1).default(0.18),
    })
    .default({ type: "gradient", videoOpacity: 0.18 }),
});

export type Script = z.infer<typeof ScriptSchema>;
