import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  COLORS,
  FONTS,
  SPACING,
  enterAnim,
  positionToJustify,
  POSITION_PADDING,
  textShadowFor,
  PLATE_STYLE,
  GLASS_BLUR,
  useTheme,
  withAlpha,
  type ScenePosition,
  type TextBackdrop,
} from "../../brand/theme";

type Props = {
  title: string;
  subtitle?: string;
  position?: ScenePosition;
  textBackdrop?: TextBackdrop;
  titleStyle?: "underline" | "band";
};

export const TitleScene: React.FC<Props> = ({
  title,
  subtitle,
  position = "center",
  textBackdrop = "shadow",
  titleStyle = "underline",
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const titleAnim = enterAnim(frame, 0);
  const subtitleAnim = enterAnim(frame, 8);
  const shadow = textShadowFor(textBackdrop);
  const isBand = titleStyle === "band";

  return (
    <AbsoluteFill
      style={{
        justifyContent: positionToJustify(position),
        alignItems: "center",
        padding: SPACING.pagePadding,
        paddingTop: position === "top" ? POSITION_PADDING.top : SPACING.pagePadding,
        paddingBottom: position === "bottom" ? POSITION_PADDING.bottom : SPACING.pagePadding,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: SPACING.gap,
          ...(textBackdrop === "plate" ? PLATE_STYLE : {}),
        }}
      >
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "stretch" }}>
          <div
            style={{
              opacity: titleAnim.opacity,
              transform: `translateY(${titleAnim.translateY}px)`,
              fontFamily: FONTS.heading,
              fontSize: FONTS.sizes.title,
              fontWeight: FONTS.weights.bold,
              color: isBand ? theme.primaryText : COLORS.text,
              lineHeight: 1.2,
              textAlign: "center",
              textShadow: isBand ? undefined : shadow,
              // band: title sits on a primary-tinted bar
              ...(isBand
                ? {
                    backgroundColor: theme.primary,
                    borderRadius: 16,
                    padding: "16px 32px",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.4)",
                  }
                : {}),
            }}
          >
            {title}
          </div>
          {/* underline spans the title width */}
          {!isBand && (
            <div
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.primary,
                opacity: titleAnim.opacity,
                marginTop: 16,
              }}
            />
          )}
        </div>

        {subtitle && (
          <div
            style={{
              opacity: subtitleAnim.opacity,
              transform: `translateY(${subtitleAnim.translateY}px)`,
              fontFamily: FONTS.body,
              fontSize: FONTS.sizes.subtitle,
              fontWeight: FONTS.weights.semibold,
              color: COLORS.text,
              lineHeight: 1.4,
              textAlign: "center",
              textShadow: shadow,
              // give the subtitle its own soft frosted chip when not on a plate
              ...(textBackdrop !== "plate"
                ? {
                    backgroundColor: withAlpha("#0B1628", 0.32),
                    backdropFilter: GLASS_BLUR,
                    WebkitBackdropFilter: GLASS_BLUR,
                    borderRadius: 14,
                    padding: "10px 22px",
                  }
                : {}),
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
