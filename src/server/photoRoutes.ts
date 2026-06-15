import express, { type Express } from "express";
import fs from "fs";
import path from "path";

import { renderPhoto } from "../photo/render";
import { PhotoSchema, photoDocSlug, type PhotoDocument } from "../photo/schema";
import { TEMPLATE_DEFS, DEFAULT_PHOTO_OPTIONS } from "../photo/templateDefs";
import { DS_DIR, RENDER_DIR, PHOTOS_DIR, PHOTO_OUTPUT_DIR } from "../photo/paths";

// ============================================================
// Photo (social-media) routes — mounted onto the existing panel
// Express server with one call from src/server/index.ts. Adds:
//   • static /photo-render (headless render page, for the iframe preview)
//   • static /ds          (gum-foto design system: tokens, bundle, assets)
//   • GET  /api/photo/templates  → form field defs + defaults + photos
//   • GET  /api/photo/assets     → available photo files
//   • POST /api/photo/render     → validate + render → PNG data URL(s)
// The video pipeline is untouched.
// ============================================================

const IMG_EXTS = [".png", ".jpg", ".jpeg", ".webp"];

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

function listPhotos(): { value: string; label: string }[] {
  const labelFor = (file: string) =>
    DEFAULT_PHOTO_OPTIONS.find((o) => o.value === file)?.label ?? file.replace(/\.[^.]+$/, "");
  if (!fs.existsSync(PHOTOS_DIR)) return DEFAULT_PHOTO_OPTIONS;
  const files = fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => !f.startsWith(".") && IMG_EXTS.includes(path.extname(f).toLowerCase()))
    .sort();
  if (files.length === 0) return DEFAULT_PHOTO_OPTIONS;
  return files.map((f) => ({ value: f, label: labelFor(f) }));
}

function nextNumber(dir: string) {
  if (!fs.existsSync(dir)) return 1;
  const highest = fs.readdirSync(dir).reduce((hi, name) => {
    const m = name.match(/^(\d+)-/);
    return m ? Math.max(hi, Number(m[1])) : hi;
  }, 0);
  return highest + 1;
}

function stamp() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  return `${date}-${time}`;
}

export function registerPhotoRoutes(app: Express) {
  // Static assets needed by the iframe preview + Puppeteer
  app.use("/photo-render", express.static(RENDER_DIR));
  app.use("/ds", express.static(DS_DIR));
  // Saved photo outputs (so the panel can link to them)
  app.use("/output/photos", express.static(PHOTO_OUTPUT_DIR));

  // Template/field definitions + live photo list (drives the panel forms)
  app.get("/api/photo/templates", (_req, res) => {
    res.json({ templates: TEMPLATE_DEFS, photos: listPhotos() });
  });

  app.get("/api/photo/assets", (_req, res) => {
    res.json({ photos: listPhotos() });
  });

  // Validate + render a document → PNG data URL(s); optionally save to disk.
  app.post("/api/photo/render", async (req, res) => {
    try {
      const body = (req.body ?? {}) as { doc?: unknown; scale?: number; save?: boolean };
      const parsed = PhotoSchema.parse(body.doc) as PhotoDocument;
      const scale = typeof body.scale === "number" ? body.scale : 2;

      const { pngs, width, height } = await renderPhoto(parsed, { scale });
      const dataUrls = pngs.map((b) => `data:image/png;base64,${b.toString("base64")}`);

      const saved: string[] = [];
      if (body.save) {
        const slug = photoDocSlug(parsed);
        const typeDir = path.join(PHOTO_OUTPUT_DIR, parsed.type);
        if (parsed.type === "carousel") {
          const num = nextNumber(typeDir);
          const folder = path.join(typeDir, `${pad3(num)}-${slug}-${stamp()}`);
          fs.mkdirSync(folder, { recursive: true });
          pngs.forEach((buf, i) => {
            const file = path.join(folder, `${pad3(i + 1)}.png`);
            fs.writeFileSync(file, buf);
            saved.push(`/output/photos/${path.relative(PHOTO_OUTPUT_DIR, file)}`);
          });
        } else {
          fs.mkdirSync(typeDir, { recursive: true });
          const num = nextNumber(typeDir);
          const file = path.join(typeDir, `${pad3(num)}-${slug}-${stamp()}.png`);
          fs.writeFileSync(file, pngs[0]);
          saved.push(`/output/photos/${path.relative(PHOTO_OUTPUT_DIR, file)}`);
        }
      }

      res.json({ ok: true, width, height, dataUrls, saved });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : String(e) });
    }
  });
}
