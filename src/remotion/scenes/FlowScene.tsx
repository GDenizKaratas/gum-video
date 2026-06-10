import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
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

type StepHighlight = { stepIndex: number; fromFrame: number };
type Props = {
  steps: string[];
  stepHighlights?: StepHighlight[];
  position?: ScenePosition;
  highlightColor?: HighlightColor;
};

function getActiveStep(frame: number, highlights: StepHighlight[] | undefined): number {
  if (!highlights || highlights.length === 0) return -1;
  let active = -1;
  for (const h of highlights) {
    if (frame >= h.fromFrame) active = h.stepIndex;
  }
  return active;
}

// Flow is a list variant: same frosted ItemCard, numbered, with one active step.
export const FlowScene: React.FC<Props> = ({
  steps,
  stepHighlights,
  position = "center",
  highlightColor = "accent",
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const containerAnim = enterAnim(frame, 0);
  const activeStep = getActiveStep(frame, stepHighlights);
  const hasHighlights = !!stepHighlights && stepHighlights.length > 0;
  const hl = resolveHighlight(theme, highlightColor);

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
      <div
        style={{
          opacity: containerAnim.opacity,
          transform: `translateY(${containerAnim.translateY}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: "100%",
        }}
      >
        {steps.map((step, i) => (
          <ItemCard
            key={i}
            index={i}
            label={step}
            isLit={activeStep === i}
            dimmed={hasHighlights}
            hl={hl}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
