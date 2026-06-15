import React from "react";
import { Composition, CalculateMetadataFunction, Folder } from "remotion";
// Side-effect: starts loading Inter font
import "./fonts";
import { VideoComposition, type VideoProps } from "./Video";
import { ShortsThumbnail, Thumbnail, thumbnailDefaultProps } from "./Thumbnail";
import { DIMENSIONS, FPS, DEFAULT_ORIENTATION } from "../config";

const defaultProps: VideoProps = {
  audioPublicPath: "",
  captionsPublicPath: "",
  timeline: { totalSec: 10, totalFrames: 300, scenes: [], warnings: [], background: { type: "gradient" as const }, highlightedWords: [], captionKaraoke: true, captionsEnabled: true, themeId: "default" },
  orientation: DEFAULT_ORIENTATION,
};

const calculateMetadata: CalculateMetadataFunction<VideoProps> = async ({
  props,
}) => {
  const orientation = props.orientation ?? DEFAULT_ORIENTATION;
  const dims = DIMENSIONS[orientation] ?? DIMENSIONS.vertical;

  const totalFrames = props.timeline?.totalFrames ?? 300;

  const slug = "video";
  const dateStr = new Date().toISOString().slice(0, 10);

  return {
    durationInFrames: Math.max(totalFrames, 30),
    width: dims.width,
    height: dims.height,
    fps: FPS,
    defaultOutName: `${slug}-${dateStr}`,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="GumrukteGuncel">
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={300}
        fps={FPS}
        width={DIMENSIONS.vertical.width}
        height={DIMENSIONS.vertical.height}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="Thumbnail"
        component={Thumbnail}
        durationInFrames={1}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={thumbnailDefaultProps}
      />
      <Composition
        id="ShortsThumbnail"
        component={ShortsThumbnail}
        durationInFrames={1}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={thumbnailDefaultProps}
      />
    </Folder>
  );
};
