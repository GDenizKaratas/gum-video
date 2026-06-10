import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { useTheme } from "../../brand/theme";

type Props = {
  type: "gradient" | "video" | "image";
  videoFile?: string;
  imageFile?: string;
  videoOpacity?: number;
  videoDurationInFrames?: number;
};

const fullBleedMediaStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

const RepeatingVideo: React.FC<{
  src: string;
  durationInFrames?: number;
}> = ({ src, durationInFrames }) => {
  const composition = useVideoConfig();

  if (!durationInFrames || durationInFrames <= 2) {
    return <Video src={src} style={fullBleedMediaStyle} objectFit="cover" muted loop />;
  }

  const cycleCount = Math.ceil(composition.durationInFrames / durationInFrames) + 1;

  return (
    <>
      {Array.from({ length: cycleCount }, (_, index) => (
        <Sequence
          key={index}
          from={index * durationInFrames}
          durationInFrames={durationInFrames}
          premountFor={15}
        >
          <Video
            src={src}
            style={fullBleedMediaStyle}
            objectFit="cover"
            muted
          />
        </Sequence>
      ))}
    </>
  );
};

export const Background: React.FC<Props> = ({
  type,
  videoFile,
  imageFile,
  videoOpacity = 0.18,
  videoDurationInFrames,
}) => {
  const theme = useTheme();
  const [g0, g1, g2] = theme.gradient;
  const gradientLayer = (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${g0} 0%, ${g1} 60%, ${g2} 100%)`,
      }}
    />
  );

  const media =
    type === "video" && videoFile
      ? "video"
      : type === "image" && imageFile
        ? "image"
        : null;

  if (!media) {
    return gradientLayer;
  }

  // When the media is shown nearly full strength, drop the readability vignette
  // so it appears "directly"; when dim, keep gradient + vignette behind text.
  const showVignette = videoOpacity < 0.6;

  return (
    <AbsoluteFill>
      {gradientLayer}
      <AbsoluteFill style={{ opacity: videoOpacity }}>
        {media === "video" ? (
          <RepeatingVideo
            src={staticFile(videoFile!)}
            durationInFrames={videoDurationInFrames}
          />
        ) : (
          <Img
            src={staticFile(imageFile!)}
            style={{ ...fullBleedMediaStyle, objectFit: "cover" }}
          />
        )}
      </AbsoluteFill>
      {showVignette && (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(10,22,40,0.55) 100%)",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
