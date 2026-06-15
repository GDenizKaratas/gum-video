import React from "react";
import { COLORS, FONTS, GLASS_BLUR } from "../../brand/theme";

type Highlight = { main: string; cardBg: string; badgeText: string };

type Props = {
  index: number; // 0-based; badge shows index+1
  label: string;
  isLit: boolean; // active/highlighted
  dimmed?: boolean; // revealed-but-not-active (sequential past items)
  hl: Highlight;
  grid?: boolean;
  numbered?: boolean; // false = small dot instead of a numbered circle
  opacity?: number;
  translateY?: number;
};

/**
 * Shared frosted-glass card used by both list and flow scenes so they look
 * identical. The "lit" signal is a colored border + colored badge (color comes
 * from the theme/highlight), while the card itself stays a dark frosted panel
 * that reads over gradients AND full-screen video.
 */
export const ItemCard: React.FC<Props> = ({
  index,
  label,
  isLit,
  dimmed = false,
  hl,
  grid = false,
  numbered = true,
  opacity = 1,
  translateY = 0,
}) => {
  const cardBg = isLit ? hl.cardBg : COLORS.cardBg;
  const border = isLit ? hl.main : COLORS.cardBorder;
  const badgeBg = isLit ? hl.main : "rgba(255,255,255,0.10)";
  const badgeText = isLit ? hl.badgeText : COLORS.textMuted;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 18,
        backgroundColor: cardBg,
        borderRadius: 18,
        padding: grid ? "20px 22px" : "22px 26px",
        border: `1.5px solid ${border}`,
        backdropFilter: GLASS_BLUR,
        WebkitBackdropFilter: GLASS_BLUR,
        flex: grid ? "1 1 calc(50% - 16px)" : undefined,
        minWidth: grid ? 260 : undefined,
        boxSizing: "border-box",
      }}
    >
      {numbered ? (
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: badgeBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: `1.5px solid ${isLit ? hl.main : "rgba(255,255,255,0.18)"}`,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.heading,
              fontSize: 22,
              fontWeight: FONTS.weights.bold,
              color: badgeText,
            }}
          >
            {index + 1}
          </span>
        </div>
      ) : (
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: isLit ? hl.main : "rgba(255,255,255,0.35)",
            flexShrink: 0,
            marginLeft: 6,
          }}
        />
      )}

      <span
        style={{
          fontFamily: FONTS.body,
          fontSize: FONTS.sizes.listItem,
          fontWeight: isLit ? FONTS.weights.bold : FONTS.weights.semibold,
          color: isLit ? COLORS.text : dimmed ? COLORS.textMuted : COLORS.text,
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </div>
  );
};
