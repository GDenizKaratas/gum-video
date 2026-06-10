import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { VideoComposition } from "../src/remotion/Video";
import { FPS, DIMENSIONS } from "../src/config";
import type { Timeline } from "../src/tts/align";
import {
  type Orientation,
  type Scene,
  type SceneType,
  type WordTiming,
  type StoredCaption,
  sceneToScript,
  scriptSceneToPanel,
} from "./types";
import { SceneEditor } from "./SceneEditor";
import { VideoPicker, type VideoAsset } from "./VideoPicker";
import { THEMES } from "../src/brand/theme";

const uid = () => Math.random().toString(36).slice(2, 9);

// --- Persistence: keep the whole editing session in localStorage ---
const STORAGE_KEY = "gg-studio-v1";
type Saved = {
  title?: string;
  voiceId?: string;
  orientation?: Orientation;
  narration?: string;
  globalBg?: "gradient" | "video" | "image";
  globalBgFile?: string;
  globalBgOpacity?: number;
  themeId?: string;
  karaoke?: boolean;
  captionsEnabled?: boolean;
  autoMode?: boolean;
  scenes?: Scene[];
  highlightedWords?: number[];
};

type RenderProgress = {
  jobId: string;
  stage: "queued" | "bundling" | "preparing" | "rendering" | "encoding" | "done" | "error";
  progress: number;
  message: string;
  fileName?: string;
  url?: string;
  error?: string;
};

function loadSaved(): Saved {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Saved;
  } catch {
    return {};
  }
}

function newScene(type: SceneType): Scene {
  const base: Scene = { id: uid(), type, afterWord: "", occurrence: 1, position: "center" };
  if (type === "flow") base.steps = ["", ""];
  if (type === "list") {
    base.items = [""];
    base.revealMode = "cumulative";
  }
  return base;
}

const SCENE_LABEL: Record<SceneType, string> = {
  hook: "Açılış",
  title: "Başlık",
  flow: "Akış",
  list: "Liste",
  stat: "İstatistik",
  image: "Görsel",
  video: "Video",
};

// Title → slug (mirrors the server's slugify) for naming the audio/captions
function slugify(title: string): string {
  const s = title
    .replace(/[İIı]/g, "i").replace(/[Şş]/g, "s").replace(/[Ğğ]/g, "g")
    .replace(/[Çç]/g, "c").replace(/[Öö]/g, "o").replace(/[Üü]/g, "u")
    .toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-").replace(/^-|-$/g, "");
  return s || "draft";
}

// Case-insensitive, Turkish-aware normalization (mirrors the server's matcher)
const normTr = (s: string) =>
  s.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}]/gu, "");

// Count which occurrence of words[i].word the index i is (1-based)
function occurrenceOf(words: WordTiming[], i: number): number {
  const target = normTr(words[i].word);
  let n = 0;
  for (let k = 0; k <= i; k++) {
    if (normTr(words[k].word) === target) n++;
  }
  return n;
}

// Start time (sec) of the Nth occurrence of a trigger word; null if not found
function findTriggerSec(words: WordTiming[], afterWord: string, occurrence: number): number | null {
  if (!afterWord) return null;
  const target = normTr(afterWord);
  let count = 0;
  for (const w of words) {
    if (normTr(w.word) === target) {
      count++;
      if (count === occurrence) return w.startSec;
    }
  }
  return null;
}

export const App: React.FC = () => {
  const saved = useMemo(loadSaved, []);
  const [title, setTitle] = useState(saved.title ?? "Gümrükte 3 Kritik Adım");
  const [voiceId, setVoiceId] = useState(saved.voiceId ?? "o9DOmAyPjfFu8AfoFAnM");
  const [orientation, setOrientation] = useState<Orientation>(saved.orientation ?? "vertical");
  const [narration, setNarration] = useState(saved.narration ?? "");
  const [globalBg, setGlobalBg] = useState<"gradient" | "video" | "image">(saved.globalBg ?? "gradient");
  const [globalBgFile, setGlobalBgFile] = useState(saved.globalBgFile ?? "");
  const [globalBgOpacity, setGlobalBgOpacity] = useState(saved.globalBgOpacity ?? 0.18);
  const [themeId, setThemeId] = useState(saved.themeId ?? "default");
  const [karaoke, setKaraoke] = useState(saved.karaoke ?? true);
  const [captionsEnabled, setCaptionsEnabled] = useState(saved.captionsEnabled ?? true);
  const [showCaptionEditor, setShowCaptionEditor] = useState(false);
  const [autoMode, setAutoMode] = useState(saved.autoMode ?? false);

  const [scenes, setScenes] = useState<Scene[]>(saved.scenes ?? []);
  const [highlightedWords, setHighlightedWords] = useState<number[]>(saved.highlightedWords ?? []);
  const [videoAssets, setVideoAssets] = useState<VideoAsset[]>([]);
  const [imageAssets, setImageAssets] = useState<VideoAsset[]>([]);
  // When set, clicking a transcript word assigns it as this scene's trigger
  const [pickingSceneId, setPickingSceneId] = useState<string | null>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [jsonText, setJsonText] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "look" | "scenes" | "json">("text");
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const [words, setWords] = useState<WordTiming[]>([]);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioPath, setAudioPath] = useState("");
  const [captions, setCaptions] = useState<StoredCaption[]>([]);

  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "info"; msg: React.ReactNode } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const renderEventsRef = useRef<EventSource | null>(null);

  // Persist the editing session to localStorage on any change
  useEffect(() => {
    const data: Saved = {
      title, voiceId, orientation, narration, globalBg, globalBgFile, globalBgOpacity,
      themeId, karaoke, captionsEnabled, autoMode, scenes, highlightedWords,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [title, voiceId, orientation, narration, globalBg, globalBgFile, globalBgOpacity, themeId, karaoke, captionsEnabled, autoMode, scenes, highlightedWords]);

  // Load available background videos
  useEffect(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((d) => {
        setVideoAssets(d.videos ?? []);
        setImageAssets(d.images ?? []);
      })
      .catch(() => {});
  }, []);

  // Load existing draft on mount (audio named by the current title's slug)
  useEffect(() => {
    fetch(`/api/draft?slug=${encodeURIComponent(slugify(title))}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.exists) {
          setWords(d.words);
          setCaptions(d.captions);
          setHasAudio(true);
          setAudioPath(d.audioPublicPath);
          setStatus({ kind: "info", msg: "Mevcut ses taslağı yüklendi." });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      renderEventsRef.current?.close();
    };
  }, []);

  const buildConfig = useCallback(() => {
    return {
      meta: { title, orientation, voiceId, theme: themeId },
      narration: narration || "x",
      scenes: scenes.map(sceneToScript),
      highlightedWords,
      captions: { enabled: captionsEnabled, karaoke },
      background:
        globalBg === "video"
          ? { type: "video", videoFile: globalBgFile, videoOpacity: globalBgOpacity }
          : globalBg === "image"
            ? { type: "image", imageFile: globalBgFile, videoOpacity: globalBgOpacity }
            : { type: "gradient" },
    };
  }, [title, orientation, voiceId, narration, scenes, highlightedWords, karaoke, captionsEnabled, themeId, globalBg, globalBgFile, globalBgOpacity]);

  // Rebuild timeline (debounced) whenever config changes and audio exists
  const debounceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!hasAudio) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildConfig()),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.error) {
            setStatus({ kind: "err", msg: d.error });
            return;
          }
          setTimeline(d.timeline);
          setCaptions(d.captions);
          setWarnings(d.timeline.warnings ?? []);
        })
        .catch((e) => setStatus({ kind: "err", msg: String(e) }));
    }, 350);
    return () => window.clearTimeout(debounceRef.current);
  }, [hasAudio, buildConfig]);

  const generateTts = async () => {
    if (!narration.trim()) {
      setStatus({ kind: "err", msg: "Önce metni yazın." });
      return;
    }
    setTtsLoading(true);
    setStatus({ kind: "info", msg: "ElevenLabs sesi üretiliyor…" });
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narration, voiceId, title }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setWords(d.words);
      setCaptions(d.captions);
      setAudioPath(d.audioPublicPath);
      setHasAudio(true);
      // Word indices changed → old manual highlights no longer line up
      setHighlightedWords([]);
      setSelWord("");
      setStatus({ kind: "ok", msg: `Ses hazır — ${d.words.length} kelime.` });
      if (autoMode) await runSuggest(narration, false);
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setTtsLoading(false);
    }
  };

  const render = async () => {
    setRendering(true);
    renderEventsRef.current?.close();
    setRenderProgress({
      jobId: "",
      stage: "queued",
      progress: 0,
      message: "Render başlatılıyor.",
    });
    setStatus({ kind: "info", msg: "Render başladı, ilerleme aşağıda görünecek." });
    try {
      const r = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildConfig(), displayCaptions: captions }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);

      const source = new EventSource(`/api/render/${d.jobId}/events`);
      renderEventsRef.current = source;

      source.onmessage = (event) => {
        const progress = JSON.parse(event.data) as RenderProgress;
        setRenderProgress(progress);

        if (progress.stage === "done") {
          source.close();
          renderEventsRef.current = null;
          setRendering(false);
          setStatus({
            kind: "ok",
            msg: (
              <>
                Video hazır:{" "}
                <a href={progress.url ?? d.url} target="_blank" rel="noreferrer">
                  {progress.fileName ?? d.fileName}
                </a>
              </>
            ),
          });
        }

        if (progress.stage === "error") {
          source.close();
          renderEventsRef.current = null;
          setRendering(false);
          setStatus({ kind: "err", msg: progress.error ?? progress.message });
        }
      };

      source.onerror = () => {
        source.close();
        renderEventsRef.current = null;
        setRendering(false);
        setStatus({ kind: "err", msg: "Render ilerleme bağlantısı koptu." });
      };
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : String(e) });
      setRendering(false);
    }
  };

  const runSuggest = async (text: string, confirmOverwrite: boolean) => {
    if (confirmOverwrite && scenes.length > 0 && !window.confirm("Mevcut sahnelerin üzerine yazılsın mı?"))
      return;
    try {
      const r = await fetch("/api/suggest-scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narration: text, title }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      const withIds: Scene[] = (d.scenes ?? []).map((s: Omit<Scene, "id">) => ({
        ...s,
        id: uid(),
      }));
      setScenes(withIds);
      setSelectedSceneId(withIds[0]?.id ?? null);
      setStatus({ kind: "ok", msg: `${withIds.length} sahne önerildi — düzenleyebilirsin.` });
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : String(e) });
    }
  };
  const suggest = () => runSuggest(narration, true);

  const onWordClick = (i: number) => {
    if (pickingSceneId) {
      // Assign this word as the trigger for the scene being edited
      const word = words[i].word;
      const occ = occurrenceOf(words, i);
      setScenes((prev) =>
        prev.map((s) =>
          s.id === pickingSceneId ? { ...s, afterWord: word, occurrence: occ } : s,
        ),
      );
      setPickingSceneId(null);
      return;
    }
    setHighlightedWords((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort((a, b) => a - b),
    );
  };

  // Distinct words → their indices in the spoken order (for the occurrence picker)
  const [selWord, setSelWord] = useState("");
  const [selOcc, setSelOcc] = useState<"all" | number>("all");
  // key = normalized word, value = { label: nicest original form, indices: [...] }
  const wordIndices = useMemo(() => {
    const m = new Map<string, { label: string; indices: number[] }>();
    words.forEach((w, i) => {
      const k = normTr(w.word);
      if (!k) return;
      const entry = m.get(k);
      if (entry) entry.indices.push(i);
      else m.set(k, { label: w.word, indices: [i] });
    });
    return m;
  }, [words]);
  const selIndices = selWord ? (wordIndices.get(selWord)?.indices ?? []) : [];
  const applyHighlight = () => {
    const toAdd = selOcc === "all" ? selIndices : [selIndices[selOcc]].filter((x) => x !== undefined);
    setHighlightedWords((prev) => Array.from(new Set([...prev, ...toAdd])).sort((a, b) => a - b));
  };

  const seekToSec = (sec: number | null) => {
    if (sec == null) return;
    playerRef.current?.seekTo(Math.round(sec * FPS));
  };

  const addScene = (sc: Scene) => {
    setScenes((p) => [...p, sc]);
    setSelectedSceneId(sc.id);
  };

  const sortScenesByTime = () => {
    setScenes((prev) =>
      [...prev].sort((a, b) => {
        const ta = findTriggerSec(words, a.afterWord, a.occurrence);
        const tb = findTriggerSec(words, b.afterWord, b.occurrence);
        if (ta == null && tb == null) return 0;
        if (ta == null) return 1;
        if (tb == null) return -1;
        return ta - tb;
      }),
    );
  };

  const importJson = () => {
    try {
      const s = JSON.parse(jsonText);
      if (s.meta) {
        if (s.meta.title) setTitle(s.meta.title);
        if (s.meta.orientation) setOrientation(s.meta.orientation);
        if (s.meta.voiceId) setVoiceId(s.meta.voiceId);
      }
      if (typeof s.narration === "string") setNarration(s.narration);
      const bg = s.background ?? { type: "gradient" };
      setGlobalBg(bg.type ?? "gradient");
      setGlobalBgFile(bg.videoFile ?? bg.imageFile ?? "");
      setGlobalBgOpacity(typeof bg.videoOpacity === "number" ? bg.videoOpacity : 0.18);
      setKaraoke(s.captions?.karaoke ?? true);
      setHighlightedWords(Array.isArray(s.highlightedWords) ? s.highlightedWords : []);
      const scs: Scene[] = [];
      if (s.hook?.text) {
        const firstWord = String(s.narration ?? "").trim().split(/\s+/)[0] ?? "";
        scs.push({ id: uid(), type: "hook", afterWord: firstWord, occurrence: 1, position: "center", text: s.hook.text });
      }
      (s.scenes ?? []).forEach((x: unknown) => scs.push(scriptSceneToPanel(x)));
      setScenes(scs);
      setSelectedSceneId(scs[0]?.id ?? null);
      setStatus({ kind: "ok", msg: "JSON yüklendi. Rötuşla ve 'Sesi Oluştur'a bas." });
    } catch (e) {
      setStatus({ kind: "err", msg: "JSON okunamadı: " + (e instanceof Error ? e.message : String(e)) });
    }
  };

  const exportJson = () => {
    const data = { ...buildConfig(), narration };
    const text = JSON.stringify(data, null, 2);
    const slug = (title || "video").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "video"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    navigator.clipboard?.writeText(text).catch(() => {});
    setJsonText(text);
    setStatus({ kind: "ok", msg: "JSON indirildi + panoya kopyalandı." });
  };

  const dims = DIMENSIONS[orientation];
  const playerProps = useMemo(() => {
    if (!timeline) return null;
    return {
      audioPublicPath: audioPath,
      captionsPublicPath: "",
      timeline,
      orientation,
      captions,
    };
  }, [timeline, audioPath, orientation, captions]);

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) ?? null;

  const TABS = [
    { id: "text", icon: "✍️", label: "Metin" },
    { id: "look", icon: "🎨", label: "Görünüm" },
    { id: "scenes", icon: "🎬", label: "Sahneler" },
    { id: "json", icon: "📋", label: "JSON" },
  ] as const;

  const needAudio = (
    <p className="hint" style={{ marginTop: 40 }}>
      Önce <b>Metin</b> sekmesinden sesi oluştur.
    </p>
  );

  return (
    <div className="app">
      {/* Left rail — section navigation */}
      <nav className="rail">
        <div className="rail-logo">GG</div>
        {TABS.map((t) => {
          const locked = t.id === "scenes" && !hasAudio;
          return (
            <button
              key={t.id}
              className={"rail-btn" + (activeTab === t.id ? " active" : "")}
              onClick={() => setActiveTab(t.id)}
              disabled={locked}
              title={t.label}
            >
              <span className="rail-icon">{t.icon}</span>
              <span className="rail-label">{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Middle — active section */}
      <div className="content">
        {activeTab === "text" && (
          <div className="panel-block">
            <h2 className="panel-title">Metin & Ses</h2>
            <div className="row">
              <div style={{ flex: 2 }}>
                <label>Başlık (dosya adı)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div style={{ flex: 2 }}>
                <label>ElevenLabs Voice ID</label>
                <input value={voiceId} onChange={(e) => setVoiceId(e.target.value)} />
              </div>
            </div>
            <label>Seslendirme metni</label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Videoda seslendirilecek metni buraya yazın…"
              style={{ minHeight: 220 }}
            />
            <div style={{ marginTop: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={generateTts} disabled={ttsLoading}>
                {ttsLoading ? "Üretiliyor…" : hasAudio ? "🔄 Sesi Yeniden Oluştur" : "🔊 Sesi Oluştur"}
              </button>
              <label className="check">
                <input type="checkbox" checked={autoMode} onChange={(e) => setAutoMode(e.target.checked)} />
                🪄 Otomatik mod (ses sonrası sahneleri kur)
              </label>
            </div>
          </div>
        )}

        {activeTab === "scenes" && (
          !hasAudio ? needAudio : (
            <div className="panel-block">
              <h2 className="panel-title">Sahneler</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <button onClick={suggest}>🪄 Otomatik öner</button>
                {scenes.length > 1 && (
                  <button className="ghost small" onClick={sortScenesByTime}>↕ Zamana göre sırala</button>
                )}
              </div>

              {/* Scene list — click to edit */}
              <div className="scene-list">
                {scenes.length === 0 && (
                  <p className="sub" style={{ margin: 0 }}>Henüz sahne yok. Aşağıdan ekle ya da “Otomatik öner”e bas.</p>
                )}
                {scenes.map((s) => {
                  const startSec = findTriggerSec(words, s.afterWord, s.occurrence);
                  const found = !s.afterWord || startSec !== null;
                  return (
                    <button
                      key={s.id}
                      className={"scene-row" + (s.id === selectedSceneId ? " active" : "")}
                      onClick={() => { setSelectedSceneId(s.id); seekToSec(startSec); }}
                    >
                      <span className="scene-row-type">{SCENE_LABEL[s.type]}</span>
                      <span className="scene-row-trig">{s.afterWord || "—"}</span>
                      <span className={"scene-row-time" + (found ? "" : " warn")}>
                        {!found ? "⚠" : startSec != null ? `${startSec.toFixed(1)}s` : "baş"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Add buttons */}
              <div className="add-row">
                {(["hook", "title", "flow", "list", "stat", "image", "video"] as SceneType[]).map((t) => (
                  <button key={t} className="ghost small" onClick={() => addScene(newScene(t))}>
                    + {SCENE_LABEL[t]}
                  </button>
                ))}
              </div>

              {/* Selected scene editor */}
              {selectedScene && (
                <div style={{ marginTop: 16 }}>
                  {(() => {
                    const startSec = findTriggerSec(words, selectedScene.afterWord, selectedScene.occurrence);
                    const found = !selectedScene.afterWord || startSec !== null;
                    return (
                      <SceneEditor
                        scene={selectedScene}
                        words={words}
                        videos={videoAssets}
                        images={imageAssets}
                        picking={pickingSceneId === selectedScene.id}
                        startSec={startSec}
                        found={found}
                        onSeek={() => seekToSec(startSec)}
                        onStartPick={() => setPickingSceneId(selectedScene.id)}
                        onChange={(next) => setScenes((prev) => prev.map((x) => (x.id === selectedScene.id ? next : x)))}
                        onRemove={() => {
                          setScenes((prev) => prev.filter((x) => x.id !== selectedScene.id));
                          setSelectedSceneId(null);
                        }}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          )
        )}

        {activeTab === "look" && (
          <div className="panel-block">
            <h2 className="panel-title">Görünüm</h2>

            <label>Tema (renk paleti)</label>
            <select value={themeId} onChange={(e) => setThemeId(e.target.value)}>
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  title={t.label}
                  onClick={() => setThemeId(t.id)}
                  style={{
                    width: 30, height: 30, borderRadius: 8, padding: 0, flex: "0 0 auto",
                    background: t.primary,
                    border: themeId === t.id ? "3px solid #1b2735" : "1px solid var(--border-strong)",
                  }}
                />
              ))}
            </div>

            <label style={{ marginTop: 18 }}>Video boyutu</label>
            <div className="toggle">
              <button className={orientation === "vertical" ? "active" : ""} onClick={() => setOrientation("vertical")}>
                📱 Shorts (dikey)
              </button>
              <button className={orientation === "horizontal" ? "active" : ""} onClick={() => setOrientation("horizontal")}>
                🖥 Normal (yatay)
              </button>
            </div>

            <label style={{ marginTop: 18 }}>Genel arka plan</label>
            <div className="toggle">
              <button className={globalBg === "gradient" ? "active" : ""} onClick={() => { setGlobalBg("gradient"); setGlobalBgFile(""); }}>Gradyan</button>
              <button className={globalBg === "video" ? "active" : ""} onClick={() => { setGlobalBg("video"); setGlobalBgFile(""); }}>Video</button>
              <button className={globalBg === "image" ? "active" : ""} onClick={() => { setGlobalBg("image"); setGlobalBgFile(""); }}>Görsel</button>
            </div>
            {globalBg === "video" && (
              <>
                <label>Arka plan videosu (public/broll/)</label>
                <VideoPicker value={globalBgFile} videos={videoAssets} onChange={setGlobalBgFile} />
              </>
            )}
            {globalBg === "image" && (
              <>
                <label>Arka plan görseli (public/images/)</label>
                <VideoPicker value={globalBgFile} videos={imageAssets} onChange={setGlobalBgFile} />
              </>
            )}
            {(globalBg === "video" || globalBg === "image") && (
              <>
                <label>Görünüm</label>
                <div className="toggle">
                  <button className={globalBgOpacity < 0.6 ? "active" : ""} onClick={() => setGlobalBgOpacity(0.18)}>Sönük (yazı okunur)</button>
                  <button className={globalBgOpacity >= 0.6 ? "active" : ""} onClick={() => setGlobalBgOpacity(1)}>Tam (direkt görünür)</button>
                </div>
              </>
            )}

            <label style={{ marginTop: 18 }}>Altyazı</label>
            <div className="toggle">
              <button className={captionsEnabled ? "active" : ""} onClick={() => setCaptionsEnabled(true)}>Açık</button>
              <button className={!captionsEnabled ? "active" : ""} onClick={() => setCaptionsEnabled(false)}>Kapalı</button>
            </div>
            {captionsEnabled && (
              <>
                <label className="check" style={{ marginTop: 12 }}>
                  <input type="checkbox" checked={karaoke} onChange={(e) => setKaraoke(e.target.checked)} />
                  Kelime senkron efekti (söylenen kelime yanar)
                </label>
                {words.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <button className="ghost small" onClick={() => setShowCaptionEditor((v) => !v)}>
                      {showCaptionEditor ? "Altyazı düzenleyiciyi kapat" : "✏️ Altyazı metnini düzenle"}
                    </button>
                  </div>
                )}
                {showCaptionEditor && (
                  <div className="caption-editor">
                    <p className="sub" style={{ margin: "8px 0" }}>
                      Kelimeyi düzelt (örn. "yirmialtı" → "26"). Zamanlama değişmez; sadece görünen yazı.
                    </p>
                    {captions.map((c, i) => (
                      <input
                        key={i}
                        value={c.text.trim()}
                        onChange={(e) => {
                          const next = captions.slice();
                          next[i] = { ...c, text: " " + e.target.value };
                          setCaptions(next);
                        }}
                        style={{ width: 110, margin: "0 4px 4px 0", display: "inline-block" }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Kelime vurgusu (altyazıda altın kelimeler) */}
            {hasAudio && (
              <>
                <label style={{ marginTop: 18 }}>Kelime vurgusu (altyazıda öne çıkan kelimeler)</label>
                {pickingSceneId ? (
                  <p className="sub" style={{ color: "var(--accent-strong)", margin: "0 0 8px" }}>
                    🎯 Sahnenin başlayacağı kelimeye tıkla.{" "}
                    <a style={{ cursor: "pointer" }} onClick={() => setPickingSceneId(null)}>(iptal)</a>
                  </p>
                ) : (
                  <p className="sub" style={{ margin: "0 0 8px" }}>
                    Öne çıkmasını istediğin kelimelere tıkla — ya da bir kelimenin tüm/belli tekrarını seç.
                  </p>
                )}
                <div className="row tight" style={{ marginBottom: 12 }}>
                  <select value={selWord} onChange={(e) => { setSelWord(e.target.value); setSelOcc("all"); }}>
                    <option value="">kelime seç…</option>
                    {Array.from(wordIndices.entries()).map(([key, { label, indices }]) => (
                      <option key={key} value={key}>{label} ({indices.length}×)</option>
                    ))}
                  </select>
                  <select
                    value={String(selOcc)}
                    onChange={(e) => setSelOcc(e.target.value === "all" ? "all" : Number(e.target.value))}
                    disabled={!selWord}
                  >
                    <option value="all">Tümü ({selIndices.length})</option>
                    {selIndices.map((_, k) => (<option key={k} value={k}>{k + 1}. tekrar</option>))}
                  </select>
                  <button className="small" style={{ flex: "0 0 auto" }} onClick={applyHighlight} disabled={!selWord}>
                    Vurgula
                  </button>
                </div>
                <div className="transcript">
                  {words.map((w, i) => (
                    <span
                      key={i}
                      className={"word" + (highlightedWords.includes(i) ? " hl" : "") + (pickingSceneId ? " picking" : "")}
                      onClick={() => onWordClick(i)}
                    >
                      {w.word}
                      <span className="idx">{i}</span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "json" && (
          <div className="panel-block">
            <h2 className="panel-title">JSON İçe / Dışa Aktar</h2>
            <button className="ghost small" onClick={exportJson}>📤 Dışa aktar (indir + kopyala)</button>
            <label style={{ marginTop: 14 }}>AI'dan gelen JSON'u yapıştır</label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{ "meta": { ... }, "narration": "...", "scenes": [ ... ] }'
              style={{ minHeight: 280, fontFamily: "monospace", fontSize: 12 }}
            />
            <div style={{ marginTop: 10 }}>
              <button onClick={importJson} disabled={!jsonText.trim()}>📥 İçe aktar (paneli doldur)</button>
            </div>
          </div>
        )}
      </div>

      {/* Right — preview + render (always visible) */}
      <div className="preview">
        {playerProps && timeline ? (
          <div className="player-frame">
            <Player
              ref={playerRef}
              component={VideoComposition}
              inputProps={playerProps}
              durationInFrames={Math.max(timeline.totalFrames, 30)}
              fps={FPS}
              compositionWidth={dims.width}
              compositionHeight={dims.height}
              style={{
                width: orientation === "vertical" ? 250 : 420,
                height: orientation === "vertical" ? 444 : 236,
              }}
              controls
              loop
            />
          </div>
        ) : (
          <p className="hint">{hasAudio ? "Önizleme hazırlanıyor…" : "Önizleme için önce sesi oluşturun."}</p>
        )}

        <div className="render-bar">
          <button onClick={render} disabled={rendering || !hasAudio}>
            {rendering ? "🎬 Render ediliyor…" : "🎬 Videoyu Render Et"}
          </button>
          {renderProgress && (
            <div className="render-progress">
              <div className="render-progress-head">
                <span>{renderProgress.message}</span>
                <strong>{Math.round(renderProgress.progress)}%</strong>
              </div>
              <div className="render-progress-track">
                <div
                  className="render-progress-fill"
                  style={{ width: `${Math.max(0, Math.min(100, renderProgress.progress))}%` }}
                />
              </div>
            </div>
          )}
          {status && <div className={"status " + status.kind}>{status.msg}</div>}
          {warnings.length > 0 && (
            <div className="warn">
              ⚠️ {warnings.length} uyarı:
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {warnings.map((w, i) => (<li key={i}>{w}</li>))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
