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
  useTheme,
  type ScenePosition,
  type TextBackdrop,
} from "../../brand/theme";

type Props = { text: string; position?: ScenePosition; textBackdrop?: TextBackdrop };

export const HookScene: React.FC<Props> = ({ text, position = "center", textBackdrop = "shadow" }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { opacity, translateY } = enterAnim(frame, 0);

  return (
    <AbsoluteFill
      style={{
        justifyContent: positionToJustify(position),
        alignItems: "center",
        padding: SPACING.pagePadding,
        paddingTop: position === "top" ? POSITION_PADDING.top : SPACING.pagePadding,
        paddingBottom: position === "bottom" ? POSITION_PADDING.bottom : SPACING.pagePadding,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: theme.primary,
          opacity,
        }}
      />

      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
          fontFamily: FONTS.heading,
          fontSize: FONTS.sizes.hook,
          fontWeight: FONTS.weights.bold,
          color: COLORS.text,
          lineHeight: 1.2,
          textShadow: textShadowFor(textBackdrop),
          ...(textBackdrop === "plate" ? PLATE_STYLE : {}),
        }}
      >
        {text.split(" ").map((word, i) => (
          <span key={i}>
            {i > 0 && " "}
            <span
              style={{
                color: /^\d+$/.test(word.replace(/[%.,]/g, ""))
                  ? theme.primary
                  : undefined,
              }}
            >
              {word}
            </span>
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
