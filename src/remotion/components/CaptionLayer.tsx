import React, { useState, useEffect } from "react";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";
import { COLORS, FONTS, useTheme } from "../../brand/theme";

const SWITCH_EVERY_MS = 1800;

const CaptionPage: React.FC<{
  page: TikTokPage;
  highlightedSet: Set<number>;
  wordIndexByFromMs: Map<number, number>;
  paddingBottom: number;
  karaoke: boolean;
}> = ({ page, highlightedSet, wordIndexByFromMs, paddingBottom, karaoke }) => {
  const HIGHLIGHT_COLOR = useTheme().primary;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const absoluteMs = page.startMs + currentMs;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom,
        paddingLeft: 48,
        paddingRight: 48,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(26,32,44,0.82)",
          borderRadius: 16,
          padding: "16px 28px",
          textAlign: "center",
          fontFamily: FONTS.body,
          fontSize: FONTS.sizes.caption,
          fontWeight: FONTS.weights.semibold,
          whiteSpace: "pre",
          lineHeight: 1.3,
        }}
      >
        {page.tokens.map((token) => {
          const wordIndex = wordIndexByFromMs.get(token.fromMs);
          const isManual =
            wordIndex !== undefined && highlightedSet.has(wordIndex);
          // Karaoke: the word currently being spoken lights up in sync with audio
          const isSpoken =
            karaoke && token.fromMs <= absoluteMs && token.toMs > absoluteMs;
          const isGold = isManual || isSpoken;
          return (
            <span
              key={token.fromMs}
              style={{
                color: isGold ? HIGHLIGHT_COLOR : COLORS.text,
                fontWeight:
                  isManual || isSpoken
                    ? FONTS.weights.bold
                    : FONTS.weights.semibold,
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

type Props = {
  captionsPublicPath?: string;
  // When provided, used directly (live preview); otherwise fetched from path
  captions?: Caption[];
  highlightedWords?: number[];
  orientation?: "vertical" | "horizontal";
  karaoke?: boolean;
};

export const CaptionLayer: React.FC<Props> = ({
  captionsPublicPath,
  captions: captionsProp,
  highlightedWords = [],
  orientation = "vertical",
  karaoke = true,
}) => {
  const { fps } = useVideoConfig();
  // Vertical (Shorts): captions sit high above the bottom UI; horizontal: near the bottom edge
  const paddingBottom = orientation === "vertical" ? 240 : 90;
  const [fetched, setFetched] = useState<Caption[] | null>(null);

  useEffect(() => {
    if (captionsProp) return;
    if (!captionsPublicPath) return;
    fetch(staticFile(captionsPublicPath))
      .then((r) => {
        if (!r.ok) return;
        return r.json();
      })
      .then((data: unknown) => {
        if (Array.isArray(data)) setFetched(data as Caption[]);
      })
      .catch(console.error);
  }, [captionsPublicPath, captionsProp]);

  const captions = captionsProp ?? fetched;
  if (!captions) return null;

  // Map each word's startMs -> its index in the spoken word list
  const wordIndexByFromMs = new Map<number, number>();
  captions.forEach((c, i) => wordIndexByFromMs.set(c.startMs, i));
  const highlightedSet = new Set(highlightedWords);

  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: SWITCH_EVERY_MS,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const startFrame = (page.startMs / 1000) * fps;
        const endFrame = next
          ? Math.min(
              (next.startMs / 1000) * fps,
              startFrame + (SWITCH_EVERY_MS / 1000) * fps,
            )
          : startFrame + (SWITCH_EVERY_MS / 1000) * fps;

        const durationInFrames = Math.round(endFrame - startFrame);
        if (durationInFrames <= 0) return null;

        return (
          <Sequence
            key={i}
            from={Math.round(startFrame)}
            durationInFrames={durationInFrames}
            premountFor={fps}
          >
            <CaptionPage
              page={page}
              highlightedSet={highlightedSet}
              wordIndexByFromMs={wordIndexByFromMs}
              paddingBottom={paddingBottom}
              karaoke={karaoke}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
