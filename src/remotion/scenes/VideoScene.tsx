import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Video } from "@remotion/media";

type Props = { file: string };

// Full-screen b-roll video clip for the duration of the scene
export const VideoScene: React.FC<Props> = ({ file }) => {
  if (!file) return null;
  return (
    <AbsoluteFill>
      <Video
        src={staticFile(file)}
        style={{ width: "100%", height: "100%" }}
        objectFit="cover"
        muted
        loop
      />
    </AbsoluteFill>
  );
};
