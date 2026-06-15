import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import {
  COLORS,
  FONTS,
  SPACING,
  GLASS_BLUR,
  enterAnim,
  positionToJustify,
  POSITION_PADDING,
  resolveHighlight,
  useTheme,
  withAlpha,
  type HighlightColor,
  type ScenePosition,
} from "../../brand/theme";

type Props = {
  value: string;
  label: string;
  emphasis?: string;
  emphasisColor?: HighlightColor;
  position?: ScenePosition;
};

export const StatScene: React.FC<Props> = ({
  value,
  label,
  emphasis,
  emphasisColor = "accent",
  position = "center",
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const valueAnim = enterAnim(frame, 0);
  const emphasisAnim = enterAnim(frame, 8);
  const labelAnim = enterAnim(frame, emphasis ? 14 : 10);
  const hl = resolveHighlight(theme, emphasisColor);
  const emphasisMain = emphasisColor === "plain" ? COLORS.text : hl.main;
  const emphasisBorder =
    emphasisColor === "plain" ? "rgba(255,255,255,0.30)" : withAlpha(hl.main, 0.52);
  const emphasisBg =
    emphasisColor === "plain" ? "rgba(255,255,255,0.08)" : withAlpha(hl.main, 0.16);

  const scale = interpolate(frame, [0, 20], [0.6, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: positionToJustify(position),
        alignItems: "center",
        flexDirection: "column",
        padding: SPACING.pagePadding,
        paddingTop: position === "top" ? POSITION_PADDING.top : SPACING.pagePadding,
        paddingBottom: position === "bottom" ? POSITION_PADDING.bottom : SPACING.pagePadding,
        gap: SPACING.gap,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.glassBg,
          borderRadius: 32,
          padding: "56px 72px",
          border: `2px solid ${withAlpha(theme.primary, 0.55)}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: emphasis ? 20 : 18,
          opacity: valueAnim.opacity,
          backdropFilter: GLASS_BLUR,
          WebkitBackdropFilter: GLASS_BLUR,
          maxWidth: 820,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            fontFamily: FONTS.heading,
            fontSize: FONTS.sizes.stat,
            fontWeight: FONTS.weights.bold,
            color: theme.primary,
            lineHeight: 1,
            textAlign: "center",
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </div>

        {emphasis && (
          <div
            style={{
              opacity: emphasisAnim.opacity,
              transform: `translateY(${emphasisAnim.translateY}px)`,
              fontFamily: FONTS.heading,
              fontSize: 46,
              fontWeight: FONTS.weights.bold,
              color: emphasisMain,
              textAlign: "center",
              lineHeight: 1.12,
              maxWidth: 680,
              overflowWrap: "anywhere",
              textShadow: emphasisColor === "plain" ? "0 2px 12px rgba(0,0,0,0.55)" : undefined,
              border: `2px solid ${emphasisBorder}`,
              backgroundColor: emphasisBg,
              borderRadius: 18,
              padding: "12px 22px",
            }}
          >
            {emphasis}
          </div>
        )}

        <div
          style={{
            opacity: labelAnim.opacity,
            transform: `translateY(${labelAnim.translateY}px)`,
            fontFamily: FONTS.body,
            fontSize: FONTS.sizes.statLabel,
            fontWeight: FONTS.weights.semibold,
            color: COLORS.text,
            textAlign: "center",
            maxWidth: 640,
            lineHeight: 1.4,
            overflowWrap: "anywhere",
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
