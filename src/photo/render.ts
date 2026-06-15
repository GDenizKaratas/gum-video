import express from "express";
import http from "http";
import type { AddressInfo } from "net";
import puppeteer, { type Browser } from "puppeteer";

import { PhotoSchema, PHOTO_DIMENSIONS, type PhotoDocument, type PhotoType } from "./schema";
import { DS_DIR, RENDER_DIR } from "./paths";

// ============================================================
// Puppeteer renderer — turns a validated photo document into PNG(s).
// The headless page (src/photo/render/index.html) renders the SAME
// design-system components the panel iframe previews, so export and
// preview are pixel-identical. Carousels produce one PNG per slide.
//
// A static server + a Chromium instance are lazily created and reused
// across renders; call closePhotoRenderer() when done (the CLI does).
// ============================================================

let serverPromise: Promise<{ server: http.Server; port: number }> | null = null;
let browserPromise: Promise<Browser> | null = null;

function getStaticServer() {
  if (!serverPromise) {
    serverPromise = new Promise((resolve) => {
      const app = express();
      app.use("/photo-render", express.static(RENDER_DIR));
      app.use("/ds", express.static(DS_DIR));
      const server = app.listen(0, "127.0.0.1", () => {
        const { port } = server.address() as AddressInfo;
        resolve({ server, port });
      });
    });
  }
  return serverPromise;
}

function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--force-color-profile=srgb"],
    });
  }
  return browserPromise;
}

export interface RenderResult {
  doc: PhotoDocument;
  /** One PNG per slide (length 1 for non-carousel). */
  pngs: Buffer[];
  width: number;
  height: number;
}

/**
 * Validate + render a photo document to PNG buffer(s).
 * @param input raw document (will be parsed by PhotoSchema)
 * @param opts.scale deviceScaleFactor (default 2 for crisp text; pass 1 for native size)
 */
export async function renderPhoto(
  input: unknown,
  opts: { scale?: number } = {},
): Promise<RenderResult> {
  const doc = PhotoSchema.parse(input) as PhotoDocument;
  const scale = opts.scale ?? 2;
  const dim = PHOTO_DIMENSIONS[doc.type as PhotoType];

  const { port } = await getStaticServer();
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width: dim.width,
      height: dim.height,
      deviceScaleFactor: scale,
    });
    await page.goto(`http://127.0.0.1:${port}/photo-render/index.html`, {
      waitUntil: "load",
    });
    await page.waitForFunction("window.__PHOTO_RENDER_READY__ === true", { timeout: 20000 });

    const pngs: Buffer[] = [];
    // First call renders slide 0 and returns the total slide count.
    const slideCount = (await page.evaluate(
      (d) => (window as unknown as { __renderDoc: (doc: unknown, slide: number) => Promise<number> }).__renderDoc(d, 0),
      doc as unknown,
    )) as number;

    for (let i = 0; i < Math.max(1, slideCount); i++) {
      if (i > 0) {
        await page.evaluate(
          (d, s) =>
            (window as unknown as { __renderDoc: (doc: unknown, slide: number) => Promise<number> }).__renderDoc(d, s),
          doc as unknown,
          i,
        );
      }
      const el = await page.$("#stage > *");
      if (!el) throw new Error("Render kök elemanı bulunamadı (#stage boş).");
      const buf = (await el.screenshot({ type: "png" })) as Buffer;
      pngs.push(buf);
    }

    return { doc, pngs, width: dim.width, height: dim.height };
  } finally {
    await page.close();
  }
}

export async function closePhotoRenderer() {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    if (b) await b.close().catch(() => {});
    browserPromise = null;
  }
  if (serverPromise) {
    const { server } = await serverPromise;
    server.close();
    serverPromise = null;
  }
}
