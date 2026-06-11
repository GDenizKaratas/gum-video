import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONTS, getTheme, withAlpha } from "../brand/theme";

export type ThumbnailProps = {
  bgImage: string; // relative to public/
  tag: string;
  title: string;
  highlight: string;
  warn: string;
  themeId: string;
};

export const thumbnailDefaultProps: ThumbnailProps = {
  bgImage: "_thumbs/thumb-bg.png",
  tag: "2026 GÜNCEL REHBER",
  title: "YABANCI PLAKALI ARAÇ",
  highlight: "YURTDIŞINDAN GETİRME",
  warn: "EN PAHALI HATALAR",
  themeId: "default",
};

export const Thumbnail: React.FC<ThumbnailProps> = ({
  bgImage,
  tag,
  title,
  highlight,
  warn,
  themeId,
}) => {
  const theme = getTheme(themeId);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1628" }}>
      {/* Background photo */}
      {bgImage && (
        <Img src={staticFile(bgImage)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}

      {/* Readability scrim — heavier on the left + bottom */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, ${withAlpha(theme.gradient[0], 0.94)} 0%, ${withAlpha(
            theme.gradient[0],
            0.8,
          )} 45%, ${withAlpha(theme.gradient[0], 0.25)} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(0deg, ${withAlpha(theme.gradient[0], 0.9)} 0%, transparent 55%)`,
        }}
      />

      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 16,
          backgroundColor: theme.primary,
        }}
      />

      {/* Logo top-right */}
      <Img
        src={staticFile("logo/gumrukte-guncel.png")}
        style={{ position: "absolute", top: 40, right: 48, height: 96, borderRadius: 16 }}
      />

      {/* Text block */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 0,
          bottom: 0,
          width: 1150,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {/* Tag chip */}
        <div
          style={{
            alignSelf: "flex-start",
            backgroundColor: theme.primary,
            color: theme.primaryText,
            fontFamily: FONTS.heading,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: 1,
            padding: "8px 20px",
            borderRadius: 10,
          }}
        >
          {tag}
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 800,
            fontSize: 66,
            lineHeight: 1.05,
            color: "#FFFFFF",
            textShadow: "0 4px 18px rgba(0,0,0,0.7)",
          }}
        >
          {title}
        </div>

        {/* Highlight — the gold eye-catcher (font shrinks for longer phrases) */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 800,
            fontSize: highlight.length > 16 ? 64 : highlight.length > 11 ? 84 : highlight.length > 7 ? 98 : 112,
            lineHeight: 1,
            color: theme.primary,
            textShadow: "0 4px 22px rgba(0,0,0,0.75)",
            whiteSpace: "nowrap",
          }}
        >
          {highlight}
        </div>

        {/* Warning band */}
        <div
          style={{
            alignSelf: "flex-start",
            backgroundColor: theme.danger,
            color: "#FFFFFF",
            fontFamily: FONTS.heading,
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: 0.5,
            padding: "10px 26px",
            borderRadius: 12,
            boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
            marginTop: 8,
          }}
        >
          {warn}
        </div>
      </div>
    </AbsoluteFill>
  );
};
