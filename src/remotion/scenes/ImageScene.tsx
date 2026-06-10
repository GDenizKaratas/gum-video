import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import {
  COLORS,
  FONTS,
  SPACING,
  enterAnim,
  positionToJustify,
  POSITION_PADDING,
  type ScenePosition,
} from "../../brand/theme";

type Props = { file: string; caption?: string; position?: ScenePosition; full?: boolean };

export const ImageScene: React.FC<Props> = ({ file, caption, position = "center", full = false }) => {
  const frame = useCurrentFrame();
  const { opacity, translateY } = enterAnim(frame, 0);

  // Full-bleed: image covers the whole frame (optional caption pinned bottom)
  if (full) {
    return (
      <AbsoluteFill style={{ opacity }}>
        <Img src={staticFile(file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {caption && (
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120 }}>
            <div
              style={{
                backgroundColor: "rgba(10,22,40,0.6)",
                borderRadius: 14,
                padding: "14px 26px",
                fontFamily: FONTS.body,
                fontSize: FONTS.sizes.statLabel,
                fontWeight: FONTS.weights.semibold,
                color: COLORS.text,
                textAlign: "center",
              }}
            >
              {caption}
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: positionToJustify(position),
        alignItems: "center",
        flexDirection: "column",
        gap: SPACING.gap,
        padding: SPACING.pagePadding,
        paddingTop: position === "top" ? POSITION_PADDING.top : SPACING.pagePadding,
        paddingBottom: position === "bottom" ? POSITION_PADDING.bottom : SPACING.pagePadding,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          width: "100%",
          maxWidth: 880,
          borderRadius: 24,
          overflow: "hidden",
          border: `2px solid ${COLORS.bgCardBorder}`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        }}
      >
        <Img
          src={staticFile(file)}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {caption && (
        <div
          style={{
            opacity,
            fontFamily: FONTS.body,
            fontSize: FONTS.sizes.statLabel,
            fontWeight: FONTS.weights.semibold,
            color: COLORS.text,
            textAlign: "center",
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          {caption}
        </div>
      )}
    </AbsoluteFill>
  );
};
