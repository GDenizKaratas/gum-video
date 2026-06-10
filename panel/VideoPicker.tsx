import React, { useEffect, useRef, useState } from "react";

export type VideoAsset = { file: string; thumb: string | null };

type Props = {
  value: string;
  videos: VideoAsset[];
  onChange: (file: string) => void;
  placeholder?: string;
};

function label(file: string): string {
  return file.replace(/^[^/]*\//, "").replace(/\.(mp4|webm|mov|jpg|jpeg|png|webp|gif)$/i, "");
}

const Thumb: React.FC<{ thumb: string | null; size?: number }> = ({ thumb, size = 40 }) => (
  <div
    style={{
      width: size,
      height: (size * 9) / 16,
      borderRadius: 5,
      flexShrink: 0,
      background: thumb ? `center / cover no-repeat url(/${thumb})` : "#dde3ec",
      border: "1px solid var(--border)",
    }}
  />
);

export const VideoPicker: React.FC<Props> = ({ value, videos, onChange, placeholder = "— video seç —" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selected = videos.find((v) => v.file === value);

  return (
    <div className="vpicker" ref={ref}>
      <button type="button" className="vpicker-btn" onClick={() => setOpen((o) => !o)}>
        {selected ? (
          <>
            <Thumb thumb={selected.thumb} />
            <span className="vpicker-label">{label(selected.file)}</span>
          </>
        ) : (
          <span className="vpicker-label muted">{placeholder}</span>
        )}
        <span className="vpicker-caret">▾</span>
      </button>

      {open && (
        <div className="vpicker-menu">
          {videos.length === 0 && <div className="vpicker-empty">public/broll/ içine .mp4 koy</div>}
          {videos.map((v) => (
            <div
              key={v.file}
              className={"vpicker-item" + (v.file === value ? " active" : "")}
              onClick={() => {
                onChange(v.file);
                setOpen(false);
              }}
            >
              <Thumb thumb={v.thumb} size={56} />
              <span className="vpicker-label">{label(v.file)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
