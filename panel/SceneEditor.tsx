import React from "react";
import type { Scene, SceneBg, ScenePosition, WordTiming } from "./types";
import { VideoPicker, type VideoAsset } from "./VideoPicker";

type Props = {
  scene: Scene;
  words: WordTiming[];
  videos: VideoAsset[];
  images: VideoAsset[];
  picking: boolean;
  startSec: number | null;
  found: boolean;
  onSeek: () => void;
  onStartPick: () => void;
  onChange: (next: Scene) => void;
  onRemove: () => void;
};

const TYPE_LABELS: Record<Scene["type"], string> = {
  hook: "Açılış (Hook)",
  title: "Başlık",
  flow: "Akış (adımlar)",
  list: "Liste",
  stat: "İstatistik",
  image: "Görsel",
  video: "Video (tam ekran)",
};

export const SceneEditor: React.FC<Props> = ({
  scene,
  words,
  videos,
  images,
  picking,
  startSec,
  found,
  onSeek,
  onStartPick,
  onChange,
  onRemove,
}) => {
  const set = (patch: Partial<Scene>) => onChange({ ...scene, ...patch });

  const setListItem = (key: "steps" | "items", idx: number, val: string) => {
    const arr = [...(scene[key] ?? [])];
    arr[idx] = val;
    set({ [key]: arr } as Partial<Scene>);
  };
  const addListItem = (key: "steps" | "items") =>
    set({ [key]: [...(scene[key] ?? []), ""] } as Partial<Scene>);
  const removeListItem = (key: "steps" | "items", idx: number) =>
    set({ [key]: (scene[key] ?? []).filter((_, i) => i !== idx) } as Partial<Scene>);

  const bgType = scene.background?.type ?? "inherit";
  const bgOpacity = scene.background?.videoOpacity ?? 0.18;
  const setBg = (type: "inherit" | "gradient" | "video" | "image") => {
    if (type === "inherit") set({ background: undefined });
    else if (type === "gradient") set({ background: { type: "gradient" } });
    else if (type === "video")
      set({ background: { type: "video", videoFile: scene.background?.videoFile ?? "", videoOpacity: bgOpacity } });
    else set({ background: { type: "image", imageFile: scene.background?.imageFile ?? "", videoOpacity: bgOpacity } });
  };
  const setBgFile = (videoFile: string) =>
    set({ background: { ...(scene.background as SceneBg), type: "video", videoFile } });
  const setBgImage = (imageFile: string) =>
    set({ background: { ...(scene.background as SceneBg), type: "image", imageFile } });
  const setBgOpacity = (videoOpacity: number) =>
    set({ background: { ...(scene.background as SceneBg), videoOpacity } });

  return (
    <div className="scene-card">
      <div className="scene-head">
        <span
          className="type"
          onClick={onSeek}
          title="Önizlemede bu ana git"
          style={{ cursor: found && startSec != null ? "pointer" : "default" }}
        >
          {TYPE_LABELS[scene.type]}
          {!found ? (
            <span className="badge warn-badge">⚠ kelime yok</span>
          ) : startSec != null ? (
            <span className="badge time-badge">▶ {startSec.toFixed(1)}sn</span>
          ) : (
            <span className="badge">başlangıç</span>
          )}
        </span>
        <button className="danger" onClick={onRemove}>
          Sil
        </button>
      </div>

      {/* Trigger word */}
      <label>Sahne ne zaman girsin? (bu kelime söylenince)</label>
      <div className="row tight">
        <div style={{ flex: 3 }}>
          <input
            list={`words-${scene.id}`}
            value={scene.afterWord}
            onChange={(e) => set({ afterWord: e.target.value })}
            placeholder="kelime seç ya da transcript'ten tıkla"
          />
          <datalist id={`words-${scene.id}`}>
            {Array.from(new Set(words.map((w) => w.word))).map((w) => (
              <option key={w} value={w} />
            ))}
          </datalist>
        </div>
        <div style={{ flex: 1 }}>
          <input
            type="number"
            min={1}
            title="Kaçıncı tekrar"
            value={scene.occurrence}
            onChange={(e) => set({ occurrence: Math.max(1, Number(e.target.value)) })}
          />
        </div>
        <button
          className={picking ? "" : "ghost"}
          style={{ flex: "0 0 auto" }}
          onClick={onStartPick}
        >
          {picking ? "👆 tıkla" : "🎯 seç"}
        </button>
      </div>

      {/* Vertical position */}
      <label>İçeriğin konumu</label>
      <div className="toggle">
        {(["top", "center", "bottom"] as ScenePosition[]).map((p) => (
          <button
            key={p}
            className={scene.position === p ? "active" : ""}
            onClick={() => set({ position: p })}
          >
            {p === "top" ? "Üst" : p === "center" ? "Orta" : "Alt"}
          </button>
        ))}
      </div>

      {(scene.type === "hook" || scene.type === "title") && (
        <>
          <label>Yazı arka planı (video tam açıkken okunur kalsın)</label>
          <div className="toggle">
            {(["none", "shadow", "plate"] as const).map((b) => (
              <button
                key={b}
                className={(scene.textBackdrop ?? "shadow") === b ? "active" : ""}
                onClick={() => set({ textBackdrop: b })}
              >
                {b === "none" ? "Yok" : b === "shadow" ? "Gölge" : "Pano"}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Type-specific */}
      {scene.type === "hook" && (
        <>
          <label>Açılış metni</label>
          <input value={scene.text ?? ""} onChange={(e) => set({ text: e.target.value })} />
        </>
      )}

      {scene.type === "title" && (
        <>
          <label>Başlık</label>
          <input value={scene.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
          <label>Alt başlık (opsiyonel)</label>
          <input value={scene.subtitle ?? ""} onChange={(e) => set({ subtitle: e.target.value })} />
          <label>Başlık stili</label>
          <div className="toggle">
            <button
              className={(scene.titleStyle ?? "underline") === "underline" ? "active" : ""}
              onClick={() => set({ titleStyle: "underline" })}
            >
              Alt çizgi
            </button>
            <button
              className={scene.titleStyle === "band" ? "active" : ""}
              onClick={() => set({ titleStyle: "band" })}
            >
              Renkli bant
            </button>
          </div>
        </>
      )}

      {scene.type === "stat" && (
        <>
          <div className="row">
            <div>
              <label>Değer</label>
              <input value={scene.value ?? ""} onChange={(e) => set({ value: e.target.value })} placeholder="CEZA" />
            </div>
            <div>
              <label>Etiket</label>
              <input value={scene.label ?? ""} onChange={(e) => set({ label: e.target.value })} placeholder="kısa açıklama" />
            </div>
          </div>
          <label>Vurgulu alt satır (opsiyonel)</label>
          <input
            value={scene.emphasis ?? ""}
            onChange={(e) => set({ emphasis: e.target.value || undefined })}
            placeholder="Gümrük vergisinin 1/4'ü"
          />
          <label style={{ marginTop: 10 }}>Vurgu rengi</label>
          <div className="toggle">
            {(["accent", "danger", "plain"] as const).map((c) => (
              <button
                key={c}
                className={(scene.emphasisColor ?? "accent") === c ? "active" : ""}
                onClick={() => set({ emphasisColor: c })}
              >
                {c === "accent" ? "Sarı" : c === "danger" ? "Kırmızı" : "Beyaz"}
              </button>
            ))}
          </div>
        </>
      )}

      {scene.type === "image" && (
        <>
          <label>Görsel (public/images/)</label>
          <VideoPicker
            value={scene.file ?? ""}
            videos={images}
            onChange={(f) => set({ file: f })}
            placeholder="— görsel seç —"
          />
          <label>Görünüm</label>
          <div className="toggle">
            <button className={!scene.full ? "active" : ""} onClick={() => set({ full: false })}>
              Ortada kart
            </button>
            <button className={scene.full ? "active" : ""} onClick={() => set({ full: true })}>
              Tam ekran
            </button>
          </div>
          <label>Alt yazı (opsiyonel)</label>
          <input value={scene.caption ?? ""} onChange={(e) => set({ caption: e.target.value })} />
        </>
      )}

      {scene.type === "video" && (
        <>
          <label>Video (public/broll/ — tam ekran oynar)</label>
          <VideoPicker
            value={scene.file ?? ""}
            videos={videos}
            onChange={(f) => set({ file: f })}
            placeholder="— video seç —"
          />
        </>
      )}

      {scene.type === "list" && (
        <>
          <label>Başlık (opsiyonel)</label>
          <input value={scene.header ?? ""} onChange={(e) => set({ header: e.target.value })} />
          {scene.header && (
            <>
              <label>Başlık stili</label>
              <div className="toggle">
                {(["underline", "band", "none"] as const).map((h) => (
                  <button
                    key={h}
                    className={(scene.headerStyle ?? "underline") === h ? "active" : ""}
                    onClick={() => set({ headerStyle: h })}
                  >
                    {h === "underline" ? "Alt çizgi" : h === "band" ? "Renkli bant" : "Düz"}
                  </button>
                ))}
              </div>
            </>
          )}
          <label className="check" style={{ marginTop: 10 }}>
            <input
              type="checkbox"
              checked={scene.numbered ?? true}
              onChange={(e) => set({ numbered: e.target.checked })}
            />
            Maddelerde numara göster
          </label>
          <label>Maddeler</label>
          {(scene.items ?? []).map((it, i) => (
            <div className="list-line" key={i}>
              <span style={{ color: "var(--muted)", fontSize: 12, alignSelf: "center", minWidth: 16 }}>{i + 1}</span>
              <input value={it} onChange={(e) => setListItem("items", i, e.target.value)} />
              <button className="danger" onClick={() => removeListItem("items", i)}>×</button>
            </div>
          ))}
          <button className="ghost small" onClick={() => addListItem("items")}>+ madde</button>

          <label style={{ marginTop: 12 }}>Maddeler nasıl belirsin?</label>
          <div className="toggle">
            <button
              className={(scene.revealMode ?? "cumulative") === "cumulative" ? "active" : ""}
              onClick={() => set({ revealMode: "cumulative" })}
            >
              Yanık kalsın (üst üste)
            </button>
            <button
              className={scene.revealMode === "sequential" ? "active" : ""}
              onClick={() => set({ revealMode: "sequential" })}
            >
              Sırayla yansın (tek tek)
            </button>
          </div>

          <label style={{ marginTop: 10 }}>Yerleşim</label>
          <div className="toggle">
            <button
              className={(scene.layout ?? "stack") === "stack" ? "active" : ""}
              onClick={() => set({ layout: "stack" })}
            >
              Liste (alt alta)
            </button>
            <button
              className={scene.layout === "grid" ? "active" : ""}
              onClick={() => set({ layout: "grid" })}
            >
              Yan yana (kart)
            </button>
          </div>

          <label style={{ marginTop: 10 }}>Aktif maddenin rengi</label>
          <div className="toggle">
            {(["accent", "danger", "plain"] as const).map((c) => (
              <button
                key={c}
                className={(scene.highlightColor ?? "accent") === c ? "active" : ""}
                onClick={() => set({ highlightColor: c })}
              >
                {c === "accent" ? "Sarı" : c === "danger" ? "Kırmızı" : "Beyaz"}
              </button>
            ))}
          </div>
          <p className="sub" style={{ margin: "6px 0 0" }}>
            Vurgu eklemezsen tüm maddeler birlikte görünür. Her madde için bir kelime
            eklersen, o kelime söylenince madde belirip yanar.
          </p>

          <label style={{ marginTop: 10 }}>Madde vurguları (kelime → madde)</label>
          {(scene.revealOn ?? []).map((h, i) => (
            <div className="row tight" key={i} style={{ marginBottom: 6 }}>
              <input
                placeholder="kelime"
                value={h.afterWord}
                onChange={(e) => {
                  const arr = [...(scene.revealOn ?? [])];
                  arr[i] = { ...arr[i], afterWord: e.target.value };
                  set({ revealOn: arr });
                }}
              />
              <select
                value={h.itemIndex}
                onChange={(e) => {
                  const arr = [...(scene.revealOn ?? [])];
                  arr[i] = { ...arr[i], itemIndex: Number(e.target.value) };
                  set({ revealOn: arr });
                }}
              >
                {(scene.items ?? []).map((it, ii) => (
                  <option key={ii} value={ii}>
                    {ii + 1}. {it || "(madde)"}
                  </option>
                ))}
              </select>
              <button
                className="danger"
                onClick={() => set({ revealOn: (scene.revealOn ?? []).filter((_, x) => x !== i) })}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="ghost small"
            onClick={() =>
              set({
                revealOn: [...(scene.revealOn ?? []), { afterWord: "", occurrence: 1, itemIndex: 0 }],
              })
            }
          >
            + vurgu
          </button>
        </>
      )}

      {scene.type === "flow" && (
        <>
          <label>Adımlar</label>
          {(scene.steps ?? []).map((st, i) => (
            <div className="list-line" key={i}>
              <span style={{ color: "var(--muted)", fontSize: 12, alignSelf: "center", minWidth: 16 }}>{i + 1}</span>
              <input value={st} onChange={(e) => setListItem("steps", i, e.target.value)} />
              <button className="danger" onClick={() => removeListItem("steps", i)}>×</button>
            </div>
          ))}
          <button className="ghost small" onClick={() => addListItem("steps")}>+ adım</button>

          <label style={{ marginTop: 10 }}>Aktif adım rengi</label>
          <div className="toggle">
            <button
              className={(scene.highlightColor ?? "accent") !== "danger" ? "active" : ""}
              onClick={() => set({ highlightColor: "accent" })}
            >
              Sarı
            </button>
            <button
              className={scene.highlightColor === "danger" ? "active" : ""}
              onClick={() => set({ highlightColor: "danger" })}
            >
              Kırmızı
            </button>
          </div>

          <label style={{ marginTop: 12 }}>Adım vurguları (kelime söylenince o adım yanar)</label>
          {(scene.highlightOn ?? []).map((h, i) => (
            <div className="row tight" key={i} style={{ marginBottom: 6 }}>
              <input
                placeholder="kelime"
                value={h.afterWord}
                onChange={(e) => {
                  const arr = [...(scene.highlightOn ?? [])];
                  arr[i] = { ...arr[i], afterWord: e.target.value };
                  set({ highlightOn: arr });
                }}
              />
              <select
                value={h.stepIndex}
                onChange={(e) => {
                  const arr = [...(scene.highlightOn ?? [])];
                  arr[i] = { ...arr[i], stepIndex: Number(e.target.value) };
                  set({ highlightOn: arr });
                }}
              >
                {(scene.steps ?? []).map((st, si) => (
                  <option key={si} value={si}>
                    {si + 1}. {st || "(adım)"}
                  </option>
                ))}
              </select>
              <button
                className="danger"
                onClick={() => set({ highlightOn: (scene.highlightOn ?? []).filter((_, x) => x !== i) })}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="ghost small"
            onClick={() =>
              set({
                highlightOn: [...(scene.highlightOn ?? []), { afterWord: "", occurrence: 1, stepIndex: 0 }],
              })
            }
          >
            + vurgu
          </button>
        </>
      )}

      {/* Optional early end */}
      <label style={{ marginTop: 12 }}>Sahne ne zaman bitsin? (opsiyonel — boşsa sonraki sahneye kadar)</label>
      <div className="row tight">
        <input
          list={`words-${scene.id}`}
          placeholder="bitiş kelimesi"
          value={scene.endAfterWord ?? ""}
          onChange={(e) => set({ endAfterWord: e.target.value || undefined })}
        />
        <input
          type="number"
          min={1}
          title="kaçıncı tekrar"
          style={{ maxWidth: 70, flex: "0 0 auto" }}
          value={scene.endOccurrence ?? 1}
          onChange={(e) => set({ endOccurrence: Math.max(1, Number(e.target.value)) })}
        />
        <input
          type="number"
          min={0}
          step={0.5}
          placeholder="veya sn"
          style={{ maxWidth: 90, flex: "0 0 auto" }}
          value={scene.durationSec ?? ""}
          onChange={(e) => set({ durationSec: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      {/* Background override */}
      <label style={{ marginTop: 12 }}>Bu sahnenin arka planı</label>
      <select value={bgType} onChange={(e) => setBg(e.target.value as "inherit" | "gradient" | "video" | "image")}>
        <option value="inherit">Genel arka planı kullan</option>
        <option value="gradient">Gradyan</option>
        <option value="video">Video</option>
        <option value="image">Görsel</option>
      </select>
      {scene.background?.type === "video" && (
        <div style={{ marginTop: 6 }}>
          <VideoPicker value={scene.background.videoFile ?? ""} videos={videos} onChange={setBgFile} />
        </div>
      )}
      {scene.background?.type === "image" && (
        <div style={{ marginTop: 6 }}>
          <VideoPicker
            value={scene.background.imageFile ?? ""}
            videos={images}
            onChange={setBgImage}
            placeholder="— görsel seç —"
          />
        </div>
      )}
      {(scene.background?.type === "video" || scene.background?.type === "image") && (
        <div className="toggle" style={{ marginTop: 6 }}>
          <button className={bgOpacity < 0.6 ? "active" : ""} onClick={() => setBgOpacity(0.18)}>
            Sönük
          </button>
          <button className={bgOpacity >= 0.6 ? "active" : ""} onClick={() => setBgOpacity(1)}>
            Tam
          </button>
        </div>
      )}
    </div>
  );
};
