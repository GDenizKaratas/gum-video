import path from "path";
import fs from "fs";
import { execFileSync } from "child_process";
import { prepare } from "./prepare";
import { ScriptSchema } from "../schema";
import { DIMENSIONS } from "../config";
import { withBrollProxies } from "../media/brollProxy";
import "dotenv/config";

async function main() {
  const args = process.argv.slice(2);
  const scriptArg = args.find((a) => !a.startsWith("--"));
  const voiceArg = args.find((a) => a.startsWith("--voice="))?.split("=")[1];
  const orientationArg = args.find((a) => a.startsWith("--orientation="))?.split("=")[1] as
    | "vertical"
    | "horizontal"
    | undefined;
  const skipTts = args.includes("--skip-tts");

  if (!scriptArg) {
    console.error(
      "Kullanım: npm run render -- scripts/example.json [--skip-tts] [--voice=ID] [--orientation=vertical|horizontal]",
    );
    process.exit(1);
  }

  const scriptPath = path.resolve(scriptArg);
  if (!fs.existsSync(scriptPath)) {
    console.error(`Hata: ${scriptPath} bulunamadı.`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(scriptPath, "utf-8")) as unknown;
  let parsed: ReturnType<typeof ScriptSchema.parse>;
  try {
    parsed = ScriptSchema.parse(raw);
  } catch (e) {
    console.error("❌ script.json doğrulama hatası:", e);
    process.exit(1);
  }

  // CLI --orientation flag overrides script.json
  const orientation = orientationArg ?? parsed.meta.orientation ?? "vertical";
  const { width, height } = DIMENSIONS[orientation] ?? DIMENSIONS.vertical;

  const slug = parsed.meta.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const publicDir = path.join(process.cwd(), "public");

  console.log("🚀 Hazırlık aşaması başlıyor...");
  const { audioPublicPath, captionsPublicPath, timeline } = await prepare(
    scriptPath,
    publicDir,
    { voiceId: voiceArg, skipTts },
  );
  const renderTimeline = withBrollProxies(timeline, publicDir);

  const inputProps = {
    audioPublicPath,
    captionsPublicPath,
    timeline: renderTimeline,
    orientation,
  };

  // Add HH-MM to filename to prevent overwriting
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  const outFile = path.join(process.cwd(), "output", `${slug}-${dateStr}-${timeStr}.mp4`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  console.log("🎬 Render başlıyor...");
  console.log(`   Format: ${width}x${height} (${orientation})`);
  console.log(`   Çıktı: ${path.basename(outFile)}`);

  execFileSync(
    "npx",
    ["remotion", "render", "VideoComposition", outFile, `--props=${JSON.stringify(inputProps)}`],
    { stdio: "inherit" },
  );

  console.log(`\n✅ Video hazır: ${outFile}`);
}

main().catch((e) => {
  console.error("❌ Hata:", e instanceof Error ? e.message : e);
  process.exit(1);
});
