import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, delayRender, continueRender } from "remotion";
import { waitUntilDone } from "./fonts";
import type { Timeline, TimedScene } from "../tts/align";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { FlowScene } from "./scenes/FlowScene";
import { ListScene } from "./scenes/ListScene";
import { StatScene } from "./scenes/StatScene";
import { ImageScene } from "./scenes/ImageScene";
import { VideoScene } from "./scenes/VideoScene";
import { Background } from "./components/Background";
import { CaptionLayer } from "./components/CaptionLayer";
import { Logo } from "./components/Logo";
import { COLORS, ThemeContext, getTheme } from "../brand/theme";

export type VideoProps = {
  audioPublicPath: string;
  captionsPublicPath: string;
  timeline: Timeline;
  orientation: "vertical" | "horizontal";
  // Optional: when provided (live preview) captions render directly without fetch
  captions?: { text: string; startMs: number; endMs: number; timestampMs: number; confidence: number | null }[];
};

function renderScene(ts: TimedScene) {
  const { scene } = ts;
  const position = scene.position ?? "center";
  switch (scene.type) {
    case "hook":
      return <HookScene text={scene.text} position={position} textBackdrop={scene.textBackdrop} />;
    case "title":
      return <TitleScene title={scene.title} subtitle={scene.subtitle} position={position} textBackdrop={scene.textBackdrop} titleStyle={scene.titleStyle} />;
    case "flow":
      return (
        <FlowScene
          steps={scene.steps}
          stepHighlights={ts.stepHighlights}
          position={position}
          highlightColor={scene.highlightColor}
        />
      );
    case "list":
      return (
        <ListScene
          items={scene.items}
          header={scene.header}
          position={position}
          itemHighlights={ts.itemHighlights}
          revealMode={scene.revealMode}
          highlightColor={scene.highlightColor}
          layout={scene.layout}
          headerStyle={scene.headerStyle}
          numbered={scene.numbered}
        />
      );
    case "stat":
      return (
        <StatScene
          value={scene.value}
          label={scene.label}
          emphasis={scene.emphasis}
          emphasisColor={scene.emphasisColor}
          position={position}
        />
      );
    case "image":
      return <ImageScene file={scene.file} caption={scene.caption} position={position} full={scene.full} />;
    case "video":
      return <VideoScene file={scene.file} />;
    case "broll":
      return null; // background video handles broll scenes
    default:
      return null;
  }
}

export const VideoComposition: React.FC<VideoProps> = ({
  audioPublicPath,
  captionsPublicPath,
  timeline,
  captions,
  orientation,
}) => {
  const [fontHandle] = useState(() => delayRender("Loading Inter font"));

  useEffect(() => {
    waitUntilDone().then(() => continueRender(fontHandle));
  }, [fontHandle]);

  const bg = timeline.background ?? { type: "gradient" as const };
  const theme = getTheme(timeline.themeId);

  return (
    <ThemeContext.Provider value={theme}>
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Global background — ONE continuous layer for the whole video so it never
          remounts. Per-scene backgrounds overlay on top; gaps fall back to this
          (no gradient "blink" at scene transitions). */}
      <Background
        type={bg.type}
        videoFile={bg.videoFile}
        imageFile={bg.imageFile}
        videoOpacity={bg.videoOpacity}
        videoDurationInFrames={bg.videoDurationInFrames}
      />

      {/* Audio track */}
      {audioPublicPath && <Audio src={staticFile(audioPublicPath)} />}

      {/* Scenes */}
      {timeline.scenes.map((ts, i) => {
        const content = renderScene(ts);
        if (!content) return null;

        const durationInFrames = ts.endFrame - ts.startFrame;
        if (durationInFrames <= 0) return null;

        return (
          <Sequence
            key={i}
            from={ts.startFrame}
            durationInFrames={durationInFrames}
            premountFor={15}
          >
            {/* Per-scene background override overlays the global background */}
            {ts.background && (
              <Background
                type={ts.background.type}
                videoFile={ts.background.videoFile}
                imageFile={ts.background.imageFile}
                videoOpacity={ts.background.videoOpacity}
                videoDurationInFrames={ts.background.videoDurationInFrames}
              />
            )}
            {content}
          </Sequence>
        );
      })}

      {/* Caption layer (can be turned off) */}
      {(timeline.captionsEnabled ?? true) && (
        <CaptionLayer
          captionsPublicPath={captionsPublicPath}
          captions={captions}
          highlightedWords={timeline.highlightedWords}
          orientation={orientation}
          karaoke={timeline.captionKaraoke ?? true}
        />
      )}

      {/* Logo — bottom-left */}
      <Logo />
    </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
