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

export const ShortsThumbnail: React.FC<ThumbnailProps> = ({
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
      {bgImage && (
        <Img
          src={staticFile(bgImage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      )}

      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${withAlpha(theme.gradient[0], 0.76)} 0%, ${withAlpha(
            theme.gradient[0],
            0.58,
          )} 34%, ${withAlpha(theme.gradient[0], 0.9)} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, ${withAlpha(theme.gradient[0], 0.88)} 0%, ${withAlpha(
            theme.gradient[0],
            0.28,
          )} 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          height: 18,
          backgroundColor: theme.primary,
        }}
      />

      <Img
        src={staticFile("logo/gumrukte-guncel.png")}
        style={{
          position: "absolute",
          top: 58,
          right: 58,
          width: 136,
          height: 136,
          objectFit: "contain",
          borderRadius: 22,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 68,
          right: 68,
          top: 300,
          bottom: 250,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 34,
        }}
      >
        <div
          style={{
            backgroundColor: theme.primary,
            color: theme.primaryText,
            fontFamily: FONTS.heading,
            fontWeight: 800,
            fontSize: 42,
            letterSpacing: 0.5,
            padding: "12px 24px",
            borderRadius: 12,
          }}
        >
          {tag}
        </div>

        <div
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 800,
            fontSize: title.length > 22 ? 82 : 92,
            lineHeight: 1.02,
            color: "#FFFFFF",
            textShadow: "0 6px 24px rgba(0,0,0,0.75)",
            maxWidth: 940,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 800,
            fontSize: highlight.length > 10 ? 150 : 190,
            lineHeight: 0.9,
            color: theme.primary,
            textShadow: "0 6px 28px rgba(0,0,0,0.8)",
            maxWidth: 940,
          }}
        >
          {highlight}
        </div>

        <div
          style={{
            backgroundColor: theme.danger,
            color: "#FFFFFF",
            fontFamily: FONTS.heading,
            fontWeight: 800,
            fontSize: warn.length > 14 ? 62 : 74,
            lineHeight: 1,
            letterSpacing: 0.5,
            padding: "18px 30px",
            borderRadius: 16,
            boxShadow: "0 16px 42px rgba(0,0,0,0.48)",
            maxWidth: 900,
          }}
        >
          {warn}
        </div>
      </div>
    </AbsoluteFill>
  );
};
