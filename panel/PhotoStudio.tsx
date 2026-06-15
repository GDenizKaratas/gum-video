import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TemplateDef, FieldDef, SlideKindDef } from "../src/photo/templateDefs";

// ============================================================
// Sosyal / Foto studio — form + live preview + export for the
// gum-foto design system. The preview is an <iframe> of the SAME
// headless render page Puppeteer uses, so "what you preview is what
// you export". Field definitions/defaults come from /api/photo/templates.
// ============================================================

type Doc = Record<string, unknown>;
type Templates = Record<string, TemplateDef>;
type PhotoOpt = { value: string; label: string };

const STORAGE_KEY = "gg-photo-v1";

function loadSaved(): { type?: string; docs?: Record<string, Doc> } {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function download(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export const PhotoStudio: React.FC = () => {
  const [templates, setTemplates] = useState<Templates | null>(null);
  const [photos, setPhotos] = useState<PhotoOpt[]>([]);
  const saved = useMemo(loadSaved, []);
  const [type, setType] = useState<string>(saved.type ?? "value");
  const [docs, setDocs] = useState<Record<string, Doc>>(saved.docs ?? {});
  const [previewSlide, setPreviewSlide] = useState(0);
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "info"; msg: React.ReactNode } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pageReady = useRef(false);

  const doc = docs[type];
  const def: TemplateDef | undefined = templates?.[type];

  // Load template defs + photos; seed any missing per-type docs with defaults.
  useEffect(() => {
    fetch("/api/photo/templates")
      .then((r) => r.json())
      .then((d: { templates: Templates; photos: PhotoOpt[] }) => {
        setTemplates(d.templates);
        setPhotos(d.photos ?? []);
        setDocs((prev) => {
          const next = { ...prev };
          for (const [t, td] of Object.entries(d.templates)) {
            if (!next[t]) next[t] = { type: t, ...structuredClone(td.defaults) };
          }
          return next;
        });
      })
      .catch((e) => setStatus({ kind: "err", msg: "Şablonlar yüklenemedi: " + String(e) }));
  }, []);

  // Persist session
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type, docs }));
  }, [type, docs]);

  // Listen for render-page lifecycle messages from the iframe
  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const data = (ev.data ?? {}) as { type?: string; error?: string };
      if (data.type === "render-page-ready") {
        pageReady.current = true;
        sendPreview();
      } else if (data.type === "render-error") {
        setStatus({ kind: "err", msg: "Önizleme hatası: " + (data.error ?? "") });
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendPreview = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !pageReady.current || !doc) return;
    win.postMessage({ type: "render", doc, slide: previewSlide }, "*");
  }, [doc, previewSlide]);

  // Debounced live preview on any doc / slide / type change
  const debounceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(sendPreview, 200);
    return () => window.clearTimeout(debounceRef.current);
  }, [sendPreview]);

  // Keep JSON view in sync when open
  useEffect(() => {
    if (showJson && doc) setJsonText(JSON.stringify(doc, null, 2));
  }, [showJson, doc]);

  const setField = (name: string, value: unknown) => {
    setDocs((prev) => ({ ...prev, [type]: { ...prev[type], [name]: value } }));
  };

  const resetDefaults = () => {
    if (!def) return;
    setDocs((prev) => ({ ...prev, [type]: { type, ...structuredClone(def.defaults) } }));
    setPreviewSlide(0);
    setStatus({ kind: "info", msg: "Örnek içerik yüklendi." });
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const t = typeof parsed.type === "string" ? parsed.type : type;
      setType(t);
      setDocs((prev) => ({ ...prev, [t]: parsed }));
      setStatus({ kind: "ok", msg: "JSON uygulandı." });
    } catch (e) {
      setStatus({ kind: "err", msg: "JSON hatası: " + (e instanceof Error ? e.message : String(e)) });
    }
  };

  const renderToServer = async (save: boolean) => {
    if (!doc) return;
    setBusy(true);
    setStatus({ kind: "info", msg: save ? "output/ klasörüne kaydediliyor…" : "PNG hazırlanıyor…" });
    try {
      const r = await fetch("/api/photo/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc, save }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      if (save) {
        setStatus({
          kind: "ok",
          msg: (
            <>
              Kaydedildi ({d.saved.length} dosya):
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {d.saved.map((s: string) => (
                  <li key={s}>
                    <a href={s} target="_blank" rel="noreferrer">{s}</a>
                  </li>
                ))}
              </ul>
            </>
          ),
        });
      } else {
        const base = String((doc.type as string) || "post");
        (d.dataUrls as string[]).forEach((url, i) =>
          download(url, d.dataUrls.length > 1 ? `${base}-${String(i + 1).padStart(2, "0")}.png` : `${base}.png`),
        );
        setStatus({ kind: "ok", msg: `${d.dataUrls.length} PNG indirildi.` });
      }
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  // ----- carousel slide helpers -----
  const slides = (doc?.slides as Doc[]) ?? [];
  const setSlides = (next: Doc[]) => setField("slides", next);
  const updateSlide = (i: number, name: string, value: unknown) =>
    setSlides(slides.map((s, k) => (k === i ? { ...s, [name]: value } : s)));
  const removeSlide = (i: number) => {
    setSlides(slides.filter((_, k) => k !== i));
    setPreviewSlide((p) => Math.max(0, Math.min(p, slides.length - 2)));
  };
  const moveSlide = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = slides.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setSlides(next);
  };
  const addSlide = (kind: SlideKindDef) => {
    setSlides([...slides, structuredClone(kind.defaults) as Doc]);
    setPreviewSlide(slides.length);
  };

  const dim = def?.dimensions ?? { width: 1080, height: 1080 };
  const scale = Math.min(360 / dim.width, 520 / dim.height);

  const renderField = (field: FieldDef, value: unknown, onChange: (v: unknown) => void) => {
    const v = (value ?? "") as string;
    const options =
      field.type === "photo" ? photos : field.options ?? [];
    if (field.type === "select" || field.type === "photo") {
      return (
        <div className="field" key={field.name}>
          <label>{field.label}</label>
          <select value={v} onChange={(e) => onChange(e.target.value)}>
            {field.type === "photo" && <option value="">(foto seç)</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      );
    }
    if (field.type === "textarea") {
      return (
        <div className="field" key={field.name}>
          <label>{field.label}{field.hint ? <span className="fhint"> · {field.hint}</span> : null}</label>
          <textarea rows={field.rows ?? 3} value={v} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    }
    return (
      <div className="field" key={field.name}>
        <label>{field.label}{field.hint ? <span className="fhint"> · {field.hint}</span> : null}</label>
        <input value={v} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  };

  return (
    <div className="app photo-app">
      {/* Left — type picker */}
      <nav className="rail">
        <div className="rail-logo">GG</div>
        {templates &&
          Object.values(templates).map((t) => (
            <button
              key={t.type}
              className={"rail-btn" + (type === t.type ? " active" : "")}
              onClick={() => { setType(t.type); setPreviewSlide(0); }}
              title={t.description}
            >
              <span className="rail-label">{t.label}</span>
            </button>
          ))}
      </nav>

      {/* Middle — editor */}
      <div className="content">
        {!def ? (
          <p className="hint">Şablonlar yükleniyor…</p>
        ) : (
          <div className="panel-block">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <h2 className="panel-title">{def.label}</h2>
              <span className="sub">{dim.width}×{dim.height}</span>
            </div>
            <p className="sub" style={{ marginTop: 0 }}>{def.description}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <button className="ghost small" onClick={resetDefaults}>↺ Örnek yükle</button>
              <button className="ghost small" onClick={() => setShowJson((v) => !v)}>
                {showJson ? "Formu göster" : "📋 JSON"}
              </button>
            </div>

            {showJson ? (
              <div>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  style={{ minHeight: 320, fontFamily: "monospace", fontSize: 12, width: "100%" }}
                />
                <div style={{ marginTop: 8 }}>
                  <button onClick={applyJson}>📥 Uygula</button>
                </div>
              </div>
            ) : def.type === "carousel" ? (
              <div>
                {def.fields.map((f) => renderField(f, doc?.[f.name], (v) => setField(f.name, v)))}
                <div className="scene-list">
                  {slides.map((s, i) => {
                    const kindDef = def.slideKinds?.find((k) => k.kind === s.kind);
                    return (
                      <div key={i} className={"slide-card" + (previewSlide === i ? " active" : "")}>
                        <div className="slide-card-head">
                          <button className="link" onClick={() => setPreviewSlide(i)} title="Önizle">
                            #{i + 1} · {kindDef?.label ?? String(s.kind)}
                          </button>
                          <span className="slide-card-actions">
                            <button className="ghost xsmall" onClick={() => moveSlide(i, -1)} disabled={i === 0}>↑</button>
                            <button className="ghost xsmall" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1}>↓</button>
                            <button className="ghost xsmall" onClick={() => removeSlide(i)}>✕</button>
                          </span>
                        </div>
                        {kindDef?.fields.map((f) => renderField(f, s[f.name], (v) => updateSlide(i, f.name, v)))}
                      </div>
                    );
                  })}
                </div>
                <div className="add-row">
                  {def.slideKinds?.map((k) => (
                    <button key={k.kind} className="ghost small" onClick={() => addSlide(k)}>+ {k.label}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {def.fields.map((f) => renderField(f, doc?.[f.name], (v) => setField(f.name, v)))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — live preview + export */}
      <div className="preview">
        <div
          className="photo-preview-box"
          style={{ width: dim.width * scale, height: dim.height * scale }}
        >
          <iframe
            ref={iframeRef}
            src="/photo-render/index.html"
            title="önizleme"
            style={{
              width: dim.width,
              height: dim.height,
              border: "none",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        </div>

        {def?.type === "carousel" && slides.length > 0 && (
          <div className="dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={"dot" + (previewSlide === i ? " on" : "")}
                onClick={() => setPreviewSlide(i)}
                aria-label={`slayt ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="render-bar">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => renderToServer(false)} disabled={busy}>⬇ PNG İndir</button>
            <button className="ghost" onClick={() => renderToServer(true)} disabled={busy}>💾 output'a kaydet</button>
          </div>
          {status && <div className={"status " + status.kind}>{status.msg}</div>}
        </div>
      </div>
    </div>
  );
};
