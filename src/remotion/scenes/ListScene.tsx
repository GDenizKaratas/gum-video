import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  COLORS,
  FONTS,
  SPACING,
  enterAnim,
  positionToJustify,
  POSITION_PADDING,
  resolveHighlight,
  useTheme,
  type ScenePosition,
  type HighlightColor,
} from "../../brand/theme";
import { ItemCard } from "../components/ItemCard";

type ItemHighlight = { itemIndex: number; fromFrame: number };
type Props = {
  items: string[];
  header?: string;
  position?: ScenePosition;
  itemHighlights?: ItemHighlight[];
  revealMode?: "cumulative" | "sequential";
  highlightColor?: HighlightColor;
  layout?: "stack" | "grid";
  headerStyle?: "underline" | "band" | "none";
  numbered?: boolean;
};

const ITEM_DELAY = 12;

export const ListScene: React.FC<Props> = ({
  items,
  header,
  position = "center",
  itemHighlights,
  revealMode = "cumulative",
  highlightColor = "accent",
  layout = "stack",
  headerStyle = "underline",
  numbered = true,
}) => {
  const theme = useTheme();
  const hl = resolveHighlight(theme, highlightColor);
  const isGrid = layout === "grid";
  const frame = useCurrentFrame();
  const headerAnim = enterAnim(frame, 0);

  const hasReveals = !!itemHighlights && itemHighlights.length > 0;
  const revealFrame = new Map<number, number>();
  itemHighlights?.forEach((h) => revealFrame.set(h.itemIndex, h.fromFrame));

  // For sequential mode: the most recently revealed item is the "active" one
  let latestIndex = -1;
  let latestFrame = -1;
  if (hasReveals) {
    for (const h of itemHighlights!) {
      if (frame >= h.fromFrame && h.fromFrame > latestFrame) {
        latestFrame = h.fromFrame;
        latestIndex = h.itemIndex;
      }
    }
  }

  return (
    <AbsoluteFill
      style={{
        padding: SPACING.pagePadding,
        paddingTop: position === "top" ? POSITION_PADDING.top : SPACING.pagePadding,
        paddingBottom: position === "bottom" ? POSITION_PADDING.bottom : SPACING.pagePadding,
        flexDirection: "column",
        justifyContent: positionToJustify(position),
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", alignItems: "center" }}>
        {header && (
          <div
            style={{
              opacity: headerAnim.opacity,
              transform: `translateY(${headerAnim.translateY}px)`,
              fontFamily: FONTS.heading,
              fontSize: FONTS.sizes.subtitle,
              fontWeight: FONTS.weights.bold,
              color: headerStyle === "band" ? theme.primaryText : COLORS.text,
              textAlign: "center",
              marginBottom: 8,
              textShadow: headerStyle === "band" ? undefined : "0 2px 12px rgba(0,0,0,0.55)",
              ...(headerStyle === "band"
                ? {
                    backgroundColor: theme.primary,
                    borderRadius: 14,
                    padding: "10px 26px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                  }
                : {}),
            }}
          >
            {headerStyle === "underline" ? (
              <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "stretch" }}>
                <span>{header}</span>
                <span style={{ height: 5, borderRadius: 3, backgroundColor: theme.primary, marginTop: 12 }} />
              </span>
            ) : (
              header
            )}
          </div>
        )}

        <div
          style={
            isGrid
              ? { display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", width: "100%" }
              : { display: "flex", flexDirection: "column", gap: 18, width: "100%" }
          }
        >
        {items.map((item, i) => {
          const delay = hasReveals ? (revealFrame.get(i) ?? 0) : i * ITEM_DELAY;
          const { opacity, translateY } = enterAnim(frame, delay);

          let isLit: boolean;
          if (!hasReveals) {
            isLit = false;
          } else if (revealMode === "sequential") {
            isLit = i === latestIndex;
          } else {
            isLit = revealFrame.has(i) && frame >= delay;
          }

          return (
            <ItemCard
              key={i}
              index={i}
              label={item}
              isLit={isLit}
              dimmed={hasReveals}
              hl={hl}
              grid={isGrid}
              numbered={numbered}
              opacity={opacity}
              translateY={translateY}
            />
          );
        })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
