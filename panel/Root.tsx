import React, { useState } from "react";
import { App } from "./App";
import { PhotoStudio } from "./PhotoStudio";

// Top-level mode switch between the video studio (existing App, untouched)
// and the new social-media / photo studio. Keeps the two pipelines fully
// separate while living in one panel app.
type Mode = "video" | "photo";

const MODE_KEY = "gg-mode-v1";

export const Root: React.FC = () => {
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem(MODE_KEY) as Mode) || "video",
  );

  const choose = (m: Mode) => {
    setMode(m);
    localStorage.setItem(MODE_KEY, m);
  };

  return (
    <div className="root-shell">
      <div className="mode-switch">
        <button
          className={mode === "video" ? "active" : ""}
          onClick={() => choose("video")}
        >
          🎬 Video
        </button>
        <button
          className={mode === "photo" ? "active" : ""}
          onClick={() => choose("photo")}
        >
          🖼 Sosyal / Foto
        </button>
      </div>
      {mode === "video" ? <App /> : <PhotoStudio />}
    </div>
  );
};
