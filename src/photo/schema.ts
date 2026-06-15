import { z } from "zod";

// ============================================================
// Photo "document" schema — the JSON contract for social-media
// content (Instagram post / carousel / video thumbnails) rendered
// from the Gümrükte Güncel design system (gum-foto).
//
// Mirrors the video pipeline's src/schema.ts discipline:
//   JSON → PhotoSchema.parse() → render → PNG
//
// Emphasis conventions inside text fields:
//   **word**  → yellow highlight (posts: <Highlight>, thumbs: <Y>)
//   !!word!!  → red "hot" emphasis (thumbnails only: <Hot>)
// ============================================================

export const PHOTO_TYPES = [
  "welcome",
  "value",
  "warning",
  "update",
  "photo",
  "carousel",
  "youtube-thumb",
  "shorts-thumb",
] as const;

export type PhotoType = (typeof PHOTO_TYPES)[number];

// Output pixel dimensions per document type.
export const PHOTO_DIMENSIONS: Record<PhotoType, { width: number; height: number }> = {
  welcome: { width: 1080, height: 1080 },
  value: { width: 1080, height: 1080 },
  warning: { width: 1080, height: 1080 },
  update: { width: 1080, height: 1080 },
  photo: { width: 1080, height: 1080 },
  carousel: { width: 1080, height: 1080 }, // per slide
  "youtube-thumb": { width: 1280, height: 720 },
  "shorts-thumb": { width: 1080, height: 1920 },
};

// Photo asset filenames live under gum-foto .../assets/photos/.
// Kept loose (any string) so new photos drop in without a schema change.
const PhotoFile = z.string().min(1);
const Scrim = z.enum(["bottom", "top", "left", "full"]).default("bottom");
const ThumbScrim = z.enum(["bottom-left", "bottom", "full"]).default("bottom-left");
const Handle = z.string().optional();

// --- Single-canvas post types (1080×1080) ---

const WelcomeDoc = z.object({
  type: z.literal("welcome"),
  title: z.string().default("GÜMRÜKTE\nGÜNCEL"),
  body: z.string().default(""),
  topics: z.union([z.string(), z.array(z.string())]).default([]),
  handle: Handle,
  brand: z.boolean().default(false),
});

const ValueDoc = z.object({
  type: z.literal("value"),
  eyebrow: z.string().default(""),
  statValue: z.string().default(""),
  statUnit: z.string().default(""),
  headline: z.string().default(""),
  body: z.string().default(""),
  icon: z.string().optional(), // LineIcon name for the eyebrow (e.g. "car")
  handle: Handle,
});

const WarningDoc = z.object({
  type: z.literal("warning"),
  eyebrow: z.string().default("UYARI"),
  hook: z.string().default(""),
  body: z.string().default(""),
  stripText: z.string().default(""),
  handle: Handle,
});

const UpdateDoc = z.object({
  type: z.literal("update"),
  eyebrow: z.string().default("2026 GÜNCEL"),
  headline: z.string().default(""),
  body: z.string().default(""),
  handle: Handle,
});

const PhotoDoc = z.object({
  type: z.literal("photo"),
  eyebrow: z.string().default(""),
  headline: z.string().default(""),
  body: z.string().default(""),
  photo: PhotoFile,
  photoPos: z.string().default("center"),
  scrim: Scrim,
  handle: Handle,
});

// --- Carousel (multi-slide, 1080×1080 each) ---

const CoverSlide = z.object({
  kind: z.literal("cover"),
  eyebrow: z.string().default(""),
  headline: z.string().default(""),
  body: z.string().default(""),
});
const StatSlide = z.object({
  kind: z.literal("stat"),
  eyebrow: z.string().default(""),
  icon: z.string().optional(),
  statValue: z.string().default(""),
  statUnit: z.string().default(""),
  body: z.string().default(""),
});
const WarningSlide = z.object({
  kind: z.literal("warning"),
  eyebrow: z.string().default(""),
  headline: z.string().default(""),
  stripText: z.string().default(""),
});
const CtaSlide = z.object({
  kind: z.literal("cta"),
  icon: z.string().default("document"),
  headline: z.string().default(""),
  body: z.string().default(""),
});

const CarouselSlide = z.discriminatedUnion("kind", [
  CoverSlide,
  StatSlide,
  WarningSlide,
  CtaSlide,
]);
export type CarouselSlide = z.infer<typeof CarouselSlide>;

const CarouselDoc = z.object({
  type: z.literal("carousel"),
  handle: Handle,
  slides: z.array(CarouselSlide).min(1).max(10),
});

// --- Video thumbnails ---

const YouTubeThumbDoc = z.object({
  type: z.literal("youtube-thumb"),
  photo: PhotoFile,
  photoPos: z.string().default("center"),
  scrim: ThumbScrim,
  grade: z.number().min(0).max(1).optional(),
  eyebrow: z.string().optional(),
  title: z.string().default(""),
  callout: z.string().optional(),
  calloutTone: z.enum(["hot", "accent"]).default("hot"),
  align: z.enum(["bottom", "center", "top"]).default("bottom"),
  brand: z.string().nullable().optional(),
});

const ShortsThumbDoc = YouTubeThumbDoc.extend({
  type: z.literal("shorts-thumb"),
  scrim: z.enum(["bottom-left", "bottom", "full"]).default("bottom"),
  align: z.enum(["bottom", "center", "top"]).default("center"),
});

export const PhotoSchema = z.discriminatedUnion("type", [
  WelcomeDoc,
  ValueDoc,
  WarningDoc,
  UpdateDoc,
  PhotoDoc,
  CarouselDoc,
  YouTubeThumbDoc,
  ShortsThumbDoc,
]);

export type PhotoDocument = z.infer<typeof PhotoSchema>;

// Turkish-aware slug (mirrors the video server's slugify)
export function photoSlugify(s: string): string {
  const out = (s ?? "")
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
  return out || "post";
}

// A short slug derived from the document's most title-like field, for filenames.
export function photoDocSlug(doc: PhotoDocument): string {
  switch (doc.type) {
    case "welcome":
      return photoSlugify(doc.title.replace(/\n/g, " "));
    case "value":
      return photoSlugify(doc.headline || doc.eyebrow || "value");
    case "warning":
      return photoSlugify(doc.hook || doc.eyebrow || "warning");
    case "update":
      return photoSlugify(doc.headline || doc.eyebrow || "update");
    case "photo":
      return photoSlugify(doc.headline || doc.eyebrow || "photo");
    case "carousel": {
      const cover = doc.slides.find((s) => s.kind === "cover");
      return photoSlugify((cover && "headline" in cover ? cover.headline : "") || "carousel");
    }
    case "youtube-thumb":
    case "shorts-thumb":
      return photoSlugify(stripEmphasis(doc.title) || doc.eyebrow || "thumb");
    default:
      return "post";
  }
}

// Remove **..** / !!..!! markers (for slugs / plain-text uses)
export function stripEmphasis(s: string): string {
  return (s ?? "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/!!([^!]+)!!/g, "$1");
}
