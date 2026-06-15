import path from "path";

// Project root (assumes the process runs from the repo root, like the video CLI)
export const ROOT = process.cwd();

// The gum-foto design system folder (tokens, _ds_bundle.js, assets, photos).
export const DS_DIR = path.join(ROOT, "gum-foto", "Gümrükte Güncel Design System");

// Headless render page + vendored React + local Archivo + shared render module.
export const RENDER_DIR = path.join(ROOT, "src", "photo", "render");

// Photos available to photo/thumbnail documents.
export const PHOTOS_DIR = path.join(DS_DIR, "assets", "photos");

// Where rendered PNGs land: output/photos/<type>/...
export const PHOTO_OUTPUT_DIR = path.join(ROOT, "output", "photos");
