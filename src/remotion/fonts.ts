import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily, waitUntilDone } = loadFont("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin", "latin-ext"],
});
