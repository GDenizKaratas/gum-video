import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { SPACING, enterAnim, COLORS } from "../../brand/theme";

export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { opacity } = enterAnim(frame, 0);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Dark gradient header strip — logo sits inside this */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 210,
          background: `linear-gradient(to bottom, ${COLORS.bgGradientStart}DD 0%, transparent 100%)`,
          opacity,
        }}
      />

      {/* Logo — top right */}
      <div
        style={{
          position: "absolute",
          top: SPACING.pagePadding - 16,
          right: SPACING.pagePadding - 16,
          opacity,
        }}
      >
        <Img
          src={staticFile("logo/gumrukte-guncel.png")}
          style={{
            height: 132,
            width: "auto",
            borderRadius: 18,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
