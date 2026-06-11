import path from "path";
import fs from "fs";
import { execFileSync } from "child_process";
import { thumbnailDefaultProps } from "../remotion/Thumbnail";

// Renders the Thumbnail composition (1280x720) to thumbnails/<name>-<date>.png
// Usage:
//   npm run thumbnail -- --title="..." --highlight="..." --warn="..." --tag="..." --bg="_thumbs/x.png" --name=konu
function flag(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : undefined;
}

function slugify(s: string): string {
  return (
    s
      .replace(/[İIı]/g, "i").replace(/[Şş]/g, "s").replace(/[Ğğ]/g, "g")
      .replace(/[Çç]/g, "c").replace(/[Öö]/g, "o").replace(/[Üü]/g, "u")
      .toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || "thumbnail"
  );
}

const props = {
  ...thumbnailDefaultProps,
  ...(flag("tag") ? { tag: flag("tag") } : {}),
  ...(flag("title") ? { title: flag("title") } : {}),
  ...(flag("highlight") ? { highlight: flag("highlight") } : {}),
  ...(flag("warn") ? { warn: flag("warn") } : {}),
  ...(flag("bg") ? { bgImage: flag("bg") } : {}),
  ...(flag("theme") ? { themeId: flag("theme") } : {}),
};

const thumbsDir = path.join(process.cwd(), "thumbnails");
fs.mkdirSync(thumbsDir, { recursive: true });

const now = new Date();
const stamp = `${now.toISOString().slice(0, 10)}-${String(now.getHours()).padStart(2, "0")}${String(
  now.getMinutes(),
).padStart(2, "0")}`;
const name = flag("name") ?? slugify(props.title);
const outFile = path.join(thumbsDir, `${name}-${stamp}.png`);

console.log(`🖼  Thumbnail üretiliyor → thumbnails/${path.basename(outFile)}`);
execFileSync("npx", ["remotion", "still", "Thumbnail", outFile, `--props=${JSON.stringify(props)}`], {
  stdio: "inherit",
  cwd: process.cwd(),
});
console.log(`✅ Hazır: ${outFile}`);
