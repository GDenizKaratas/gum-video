import fs from "fs";
import path from "path";
import type { Orientation } from "./config";

export type RenderOutputKind = "shorts" | "videos";

export function getRenderOutputKind(orientation: Orientation): RenderOutputKind {
  return orientation === "vertical" ? "shorts" : "videos";
}

export function getRenderOutputDir(root: string, orientation: Orientation) {
  return path.join(root, "output", getRenderOutputKind(orientation));
}

export function getRenderOutputFile(root: string, orientation: Orientation, fileName: string) {
  return path.join(getRenderOutputDir(root, orientation), fileName);
}

function formatRenderOutputNumber(index: number) {
  return String(index).padStart(3, "0");
}

export function getNextRenderOutputNumber(root: string, orientation: Orientation) {
  const dir = getRenderOutputDir(root, orientation);
  if (!fs.existsSync(dir)) return 1;

  const mp4Files = fs
    .readdirSync(dir)
    .filter((name) => path.extname(name).toLowerCase() === ".mp4");
  const highestExplicitNumber = mp4Files.reduce((highest, name) => {
    const match = name.match(/^(\d+)-/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return Math.max(highestExplicitNumber, mp4Files.length) + 1;
}

export function getNumberedRenderOutputFileName(
  root: string,
  orientation: Orientation,
  baseFileName: string,
) {
  const dir = getRenderOutputDir(root, orientation);
  fs.mkdirSync(dir, { recursive: true });

  let outputNumber = getNextRenderOutputNumber(root, orientation);
  while (true) {
    const fileName = `${formatRenderOutputNumber(outputNumber)}-${baseFileName}`;
    if (!fs.existsSync(path.join(dir, fileName))) return fileName;
    outputNumber++;
  }
}

export function getRenderOutputRelativePath(orientation: Orientation, fileName: string) {
  return path.posix.join(getRenderOutputKind(orientation), fileName);
}

export function getRenderOutputUrl(orientation: Orientation, fileName: string) {
  return `/output/${getRenderOutputRelativePath(orientation, fileName)}`;
}
