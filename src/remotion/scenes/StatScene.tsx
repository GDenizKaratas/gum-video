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
  useTheme,
  withAlpha,
  type ScenePosition,
} from "../../brand/theme";

type Props = { value: string; label: string; position?: ScenePosition };

export const StatScene: React.FC<Props> = ({ value, label, position = "center" }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const valueAnim = enterAnim(frame, 0);
  const labelAnim = enterAnim(frame, 10);

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
          gap: 18,
          opacity: valueAnim.opacity,
          backdropFilter: GLASS_BLUR,
          WebkitBackdropFilter: GLASS_BLUR,
          maxWidth: 760,
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
          }}
        >
          {value}
        </div>

        <div
          style={{
            opacity: labelAnim.opacity,
            transform: `translateY(${labelAnim.translateY}px)`,
            fontFamily: FONTS.body,
            fontSize: FONTS.sizes.statLabel,
            fontWeight: FONTS.weights.semibold,
            color: COLORS.text,
            textAlign: "center",
            maxWidth: 600,
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
