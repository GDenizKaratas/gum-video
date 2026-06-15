import fs from "fs";
import path from "path";

import { renderPhoto, closePhotoRenderer } from "../photo/render";
import { photoDocSlug, type PhotoDocument } from "../photo/schema";
import { PHOTO_OUTPUT_DIR } from "../photo/paths";

// ============================================================
// Photo CLI — mirrors src/cli/build.ts for the social-media pipeline.
//   npm run photo -- scripts/photo/value-ornek.json [--scale=2]
// JSON → PhotoSchema (inside renderPhoto) → PNG(s) under output/photos/.
// ============================================================

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (const a of argv) {
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      flags[k] = v ?? "true";
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

function nextNumber(dir: string) {
  if (!fs.existsSync(dir)) return 1;
  const entries = fs.readdirSync(dir);
  const highest = entries.reduce((hi, name) => {
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

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const jsonPath = positional[0];
  if (!jsonPath) {
    console.error("Kullanım: npm run photo -- <script.json> [--scale=2]");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const scale = flags.scale ? Number(flags.scale) : 2;

  console.log(`📐 Render ediliyor: ${jsonPath} (scale=${scale})`);
  const { doc, pngs, width, height } = await renderPhoto(raw, { scale });
  const d = doc as PhotoDocument;
  const slug = photoDocSlug(d);
  const typeDir = path.join(PHOTO_OUTPUT_DIR, d.type);

  const written: string[] = [];

  if (d.type === "carousel") {
    // One folder per carousel: output/photos/carousel/NNN-slug-date/01.png …
    const num = nextNumber(typeDir);
    const folder = path.join(typeDir, `${pad3(num)}-${slug}-${stamp()}`);
    fs.mkdirSync(folder, { recursive: true });
    pngs.forEach((buf, i) => {
      const file = path.join(folder, `${pad3(i + 1)}.png`);
      fs.writeFileSync(file, buf);
      written.push(file);
    });
  } else {
    fs.mkdirSync(typeDir, { recursive: true });
    const num = nextNumber(typeDir);
    const file = path.join(typeDir, `${pad3(num)}-${slug}-${stamp()}.png`);
    fs.writeFileSync(file, pngs[0]);
    written.push(file);
  }

  await closePhotoRenderer();

  console.log(`✅ ${written.length} görsel (${width}×${height}):`);
  for (const f of written) console.log(`   ${path.relative(process.cwd(), f)}`);
}

main().catch(async (e) => {
  console.error("❌ Hata:", e instanceof Error ? e.message : e);
  await closePhotoRenderer().catch(() => {});
  process.exit(1);
});
