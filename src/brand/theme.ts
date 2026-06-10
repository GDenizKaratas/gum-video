import React from "react";
import { Easing } from "remotion";

// ---------------------------------------------------------------------------
// THEME PRESETS — switch the whole look (primary color + gradient) per channel
// ---------------------------------------------------------------------------
export type ThemePalette = {
  id: string;
  label: string;
  primary: string; // accent color (highlights, badges, underline)
  primaryStrong: string; // brighter variant
  primaryText: string; // readable text ON the primary color (badges)
  danger: string; // mistakes / warnings
  gradient: [string, string, string]; // background gradient stops
};

export const THEMES: Record<string, ThemePalette> = {
  default: {
    id: "default",
    label: "Gümrükte Güncel — Lacivert / Altın",
    primary: "#F0A500",
    primaryStrong: "#FFC23C",
    primaryText: "#0A1628",
    danger: "#FF5A5F",
    gradient: ["#0A1628", "#162444", "#1A3060"],
  },
  ocean: {
    id: "ocean",
    label: "Okyanus — Mavi",
    primary: "#3DA9FC",
    primaryStrong: "#7DC7FF",
    primaryText: "#04203A",
    danger: "#FF6B6B",
    gradient: ["#04121F", "#0C2742", "#103658"],
  },
  emerald: {
    id: "emerald",
    label: "Zümrüt — Yeşil",
    primary: "#2FD08A",
    primaryStrong: "#6FE7B4",
    primaryText: "#04241A",
    danger: "#FB7185",
    gradient: ["#04140E", "#0A2A1E", "#0E3B2A"],
  },
  sunset: {
    id: "sunset",
    label: "Gün Batımı — Turuncu/Bordo",
    primary: "#FF7849",
    primaryStrong: "#FF9D74",
    primaryText: "#2A0A04",
    danger: "#FF4D6D",
    gradient: ["#1A0A12", "#2C1018", "#3A1622"],
  },
};

export function getTheme(id?: string): ThemePalette {
  return THEMES[id ?? "default"] ?? THEMES.default;
}

// Active theme available to all scene components without prop drilling
export const ThemeContext = React.createContext<ThemePalette>(THEMES.default);
export const useTheme = (): ThemePalette => React.useContext(ThemeContext);

// hex (#RRGGBB) → rgba(...) with the given alpha
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Static (non-theme) colors + frosted-glass tokens that read on ANY background
export const COLORS = {
  // Backgrounds
  bg: "#0A1628",
  bgGradientStart: "#0A1628",
  bgGradientEnd: "#162444",
  // Frosted glass — dark translucent so white text reads over gradient AND video
  glassBg: "rgba(11,22,40,0.42)",
  glassStrong: "rgba(11,22,40,0.55)",
  cardBg: "rgba(11,22,40,0.34)",
  cardBorder: "rgba(255,255,255,0.12)",
  // back-compat aliases (older code paths)
  bgCard: "rgba(11,22,40,0.34)",
  bgCardBorder: "rgba(255,255,255,0.12)",
  bgCardActive: "rgba(11,22,40,0.55)",
  // Text
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.82)", // brighter so subtitles/labels stay readable
  textDark: "#0A1628",
  // Accent / danger fallbacks (themes override via context)
  accent: "#F0A500",
  accentDim: "rgba(240,165,0,0.22)",
  danger: "#FF5A5F",
  dangerDim: "rgba(255,90,95,0.18)",
  success: "#3FB950",
} as const;

export const GLASS_BLUR = "blur(16px)";

export type HighlightColor = "accent" | "danger" | "plain";

// Colors used to mark an "active/lit" list item or flow step. Card stays a dark
// frosted panel (readable everywhere); the COLOR comes from border + badge.
export function resolveHighlight(theme: ThemePalette, color: HighlightColor = "accent") {
  if (color === "danger") {
    return { main: theme.danger, cardBg: COLORS.glassStrong, badgeText: "#FFFFFF" };
  }
  if (color === "plain") {
    return { main: "rgba(255,255,255,0.85)", cardBg: COLORS.glassStrong, badgeText: COLORS.textDark };
  }
  return { main: theme.primary, cardBg: COLORS.glassStrong, badgeText: theme.primaryText };
}

export const FONTS = {
  heading: "Inter",
  body: "Inter",
  sizes: {
    hook: 96,
    title: 80,
    subtitle: 48,
    flowStep: 42,
    listItem: 44,
    stat: 128,
    statLabel: 40,
    caption: 46,
  },
  weights: {
    bold: 700,
    semibold: 600,
    regular: 400,
  },
} as const;

export const SPACING = {
  pagePadding: 72,
  cardPadding: 48,
  gap: 36,
} as const;

export const ENTER_DURATION_FRAMES = 20;

export function enterAnim(frame: number, delayFrames = 0) {
  const f = Math.max(0, frame - delayFrames);
  const progress = Math.min(1, f / ENTER_DURATION_FRAMES);
  const eased = Easing.bezier(0.16, 1, 0.3, 1)(progress);
  return {
    opacity: eased,
    translateY: (1 - eased) * 24,
  };
}

export const ACTIVE_STEP_OPACITY = 1;
export const INACTIVE_STEP_OPACITY = 0.3;

export type ScenePosition = "top" | "center" | "bottom";

// Maps a scene's vertical placement to flexbox justifyContent.
// Top/bottom get extra padding so content clears the logo header / captions.
export function positionToJustify(position: ScenePosition = "center") {
  return position === "top"
    ? "flex-start"
    : position === "bottom"
      ? "flex-end"
      : "center";
}

export const POSITION_PADDING = {
  top: 220, // clear the logo header strip
  bottom: 320, // clear the caption box
} as const;

export type TextBackdrop = "none" | "shadow" | "plate";

// Soft shadow that keeps light text readable over any background
export const TEXT_SHADOW =
  "0 2px 14px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.65)";

export function textShadowFor(b: TextBackdrop = "shadow"): string | undefined {
  if (b === "none") return undefined;
  if (b === "plate") return "0 1px 3px rgba(0,0,0,0.45)";
  return TEXT_SHADOW;
}

// Soft frosted-glass panel behind floating text — subtle, not a heavy block
export const PLATE_STYLE = {
  backgroundColor: "rgba(11,22,40,0.38)",
  backdropFilter: GLASS_BLUR,
  WebkitBackdropFilter: GLASS_BLUR,
  borderRadius: 28,
  padding: "34px 46px",
  border: "1px solid rgba(255,255,255,0.10)",
} as const;
