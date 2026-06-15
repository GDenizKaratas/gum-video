import { PHOTO_DIMENSIONS, type PhotoType } from "./schema";

// ============================================================
// Template + field definitions — the single source that drives:
//   • the panel's dynamic forms ("Sosyal/Foto" tab)
//   • /api/photo/templates
//   • default documents ("Örnek Yükle")
// Mirrors the field set from gum-foto's editor.html, extended to
// all 8 document types. The render mapping (doc → React) lives in
// src/photo/render/templates.js; this file is data only.
// ============================================================

export type FieldType = "text" | "textarea" | "select" | "number" | "photo";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  rows?: number;
  options?: { value: string; label: string }[];
  hint?: string;
}

export interface SlideKindDef {
  kind: string;
  label: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

export interface TemplateDef {
  type: PhotoType;
  label: string;
  description: string;
  dimensions: { width: number; height: number };
  /** Default document fields (without `type`). */
  defaults: Record<string, unknown>;
  /** Flat fields for single-canvas types. Empty for carousel (uses slideKinds). */
  fields: FieldDef[];
  /** Per-slide-kind field defs (carousel only). */
  slideKinds?: SlideKindDef[];
}

// Photos available under gum-foto .../assets/photos/. Populated at runtime by
// the server, but these are the known defaults so the UI works offline too.
export const DEFAULT_PHOTO_OPTIONS: { value: string; label: string }[] = [
  { value: "liman-gemi.png", label: "Liman / Gemi" },
  { value: "konteyner-vinc.png", label: "Konteyner / Vinç" },
  { value: "arac-arazi.png", label: "Araç / Arazi" },
  { value: "arac-yol.png", label: "Yabancı Plaka Yol" },
  { value: "yabanci-plaka.png", label: "Yabancı Plaka" },
];

const ICON_OPTIONS = [
  { value: "", label: "(yok)" },
  { value: "car", label: "Araç" },
  { value: "ship", label: "Gemi / Liman" },
  { value: "truck", label: "Kamyon / Lojistik" },
  { value: "container", label: "Konteyner" },
  { value: "scale", label: "Terazi" },
  { value: "document", label: "Belge / Mevzuat" },
  { value: "globe", label: "Dünya" },
  { value: "alert", label: "Uyarı" },
];

const PHOTO_POS_OPTIONS = [
  { value: "center", label: "Orta" },
  { value: "top", label: "Üst" },
  { value: "bottom", label: "Alt" },
  { value: "left", label: "Sol" },
  { value: "right", label: "Sağ" },
];

const handleField: FieldDef = { name: "handle", label: "Alt etiket", type: "text" };

export const TEMPLATE_DEFS: Record<PhotoType, TemplateDef> = {
  welcome: {
    type: "welcome",
    label: "Karşılama",
    description: "Marka kimliği ve tanıtım için sade açılış gönderisi.",
    dimensions: PHOTO_DIMENSIONS.welcome,
    defaults: {
      title: "GÜMRÜKTE\nGÜNCEL",
      body: "Gümrük ve dış ticaret mevzuatını sade, doğru ve **güncel** anlatıyoruz.",
      topics: "İthalat, İhracat, Vergi, Lojistik, Mevzuat",
      handle: "@gumrukteguncel",
      brand: false,
    },
    fields: [
      { name: "title", label: "Başlık", type: "textarea", rows: 3 },
      { name: "body", label: "Paragraf", type: "textarea", rows: 4, hint: "**...** ile sarı vurgu" },
      { name: "topics", label: "Konu etiketi (virgülle ayır)", type: "text" },
      handleField,
    ],
  },
  value: {
    type: "value",
    label: "Değer",
    description: "Anahtar sayı + soru başlık + kısa cevap.",
    dimensions: PHOTO_DIMENSIONS.value,
    defaults: {
      eyebrow: "YABANCI PLAKALI ARAÇ",
      icon: "car",
      statValue: "730",
      statUnit: "GÜN",
      headline: "Yabancı plakalı araç Türkiye'de ne kadar kalır?",
      body: "Cevap kim olduğuna göre değişiyor. Detaylar YouTube kanalımızda.",
      handle: "@gumrukteguncel",
    },
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "icon", label: "Eyebrow ikonu", type: "select", options: ICON_OPTIONS },
      { name: "statValue", label: "Stat değeri", type: "text" },
      { name: "statUnit", label: "Stat birimi", type: "text" },
      { name: "headline", label: "Manşet", type: "textarea", rows: 3, hint: "**...** ile sarı vurgu" },
      { name: "body", label: "Paragraf", type: "textarea", rows: 4 },
      handleField,
    ],
  },
  warning: {
    type: "warning",
    label: "Uyarı",
    description: "Kanca başlık + sarı uyarı şeridi.",
    dimensions: PHOTO_DIMENSIONS.warning,
    defaults: {
      eyebrow: "UYARI",
      hook: "En **pahalı** hata",
      body: "Yabancı plakalı arabanı Türkiye'de ailene bırakıp çıkarsan ne olur? Çoğu kişi bunu **masum** sanıyor.",
      stripText: "Gümrük vergisinin ¼'ü ceza + araç men",
      handle: "@gumrukteguncel",
    },
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "hook", label: "Kanca başlık", type: "textarea", rows: 3, hint: "**...** ile sarı vurgu" },
      { name: "body", label: "Paragraf", type: "textarea", rows: 4 },
      { name: "stripText", label: "Uyarı şeridi", type: "text" },
      handleField,
    ],
  },
  update: {
    type: "update",
    label: "Güncel",
    description: "Haber / güncel mevzuat duyurusu.",
    dimensions: PHOTO_DIMENSIONS.update,
    defaults: {
      eyebrow: "2026 GÜNCEL",
      headline: "Kurallar sürekli **değişiyor**",
      body: "27 Şubat 2026'da yürürlüğe giren yeni düzenlemeler dış ticareti doğrudan etkiliyor. Takipte kalın.",
      handle: "@gumrukteguncel",
    },
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "headline", label: "Manşet", type: "textarea", rows: 3, hint: "**...** ile sarı vurgu" },
      { name: "body", label: "Paragraf", type: "textarea", rows: 4 },
      handleField,
    ],
  },
  photo: {
    type: "photo",
    label: "Fotoğraf",
    description: "Fotoğraf arka planlı, lacivert scrim'li post.",
    dimensions: PHOTO_DIMENSIONS.photo,
    defaults: {
      eyebrow: "İHRACAT",
      headline: "İhracatta gümrük süreçleri **nasıl işliyor?**",
      body: "Beyannameden konşimentoya, adım adım anlattık. Detaylar YouTube kanalımızda.",
      photo: "liman-gemi.png",
      photoPos: "center",
      scrim: "bottom",
      handle: "@gumrukteguncel",
    },
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "headline", label: "Manşet", type: "textarea", rows: 3, hint: "**...** ile sarı vurgu" },
      { name: "body", label: "Paragraf", type: "textarea", rows: 4 },
      { name: "photo", label: "Fotoğraf", type: "photo" },
      { name: "photoPos", label: "Fotoğraf konumu", type: "select", options: PHOTO_POS_OPTIONS },
      {
        name: "scrim",
        label: "Scrim yönü",
        type: "select",
        options: [
          { value: "bottom", label: "Alt" },
          { value: "top", label: "Üst" },
          { value: "left", label: "Sol" },
          { value: "full", label: "Tam" },
        ],
      },
      handleField,
    ],
  },
  carousel: {
    type: "carousel",
    label: "Carousel (Kaydırmalı)",
    description: "Çok kareli eğitici carousel — kapak → stat → uyarı → CTA.",
    dimensions: PHOTO_DIMENSIONS.carousel,
    defaults: {
      handle: "@gumrukteguncel",
      slides: [
        { kind: "cover", eyebrow: "BİLGİ NOTU · ARAÇ", headline: "Yabancı plakalı araç **rehberi**", body: "Süre, kurallar ve en sık yapılan hata — kaydırın." },
        { kind: "stat", eyebrow: "NE KADAR KALIR?", icon: "car", statValue: "730", statUnit: "GÜN", body: "Yabancı plakalı bir araç Türkiye'de azami **730 gün** kalabilir." },
        { kind: "warning", eyebrow: "EN PAHALI HATA", headline: "Aracı ailene bırakıp **çıkarsan** ne olur?", stripText: "Gümrük vergisinin ¼'ü ceza + araç men" },
        { kind: "cta", icon: "document", headline: "Detaylar **YouTube** kanalımızda", body: "Takipte kalın · @gumrukteguncel" },
      ],
    },
    fields: [],
    slideKinds: [
      {
        kind: "cover",
        label: "Kapak",
        defaults: { kind: "cover", eyebrow: "", headline: "", body: "" },
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "headline", label: "Manşet", type: "textarea", rows: 2 },
          { name: "body", label: "Alt metin", type: "textarea", rows: 2 },
        ],
      },
      {
        kind: "stat",
        label: "İstatistik",
        defaults: { kind: "stat", eyebrow: "", icon: "car", statValue: "", statUnit: "", body: "" },
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "icon", label: "İkon", type: "select", options: ICON_OPTIONS },
          { name: "statValue", label: "Stat değeri", type: "text" },
          { name: "statUnit", label: "Stat birimi", type: "text" },
          { name: "body", label: "Açıklama", type: "textarea", rows: 2 },
        ],
      },
      {
        kind: "warning",
        label: "Uyarı",
        defaults: { kind: "warning", eyebrow: "", headline: "", stripText: "" },
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "headline", label: "Manşet", type: "textarea", rows: 2 },
          { name: "stripText", label: "Uyarı şeridi", type: "text" },
        ],
      },
      {
        kind: "cta",
        label: "CTA",
        defaults: { kind: "cta", icon: "document", headline: "", body: "" },
        fields: [
          { name: "icon", label: "İkon", type: "select", options: ICON_OPTIONS },
          { name: "headline", label: "Manşet", type: "textarea", rows: 2 },
          { name: "body", label: "Alt metin", type: "text" },
        ],
      },
    ],
  },
  "youtube-thumb": {
    type: "youtube-thumb",
    label: "YouTube Thumbnail",
    description: "16:9 video küçük resmi — foto, ağır başlık, callout.",
    dimensions: PHOTO_DIMENSIONS["youtube-thumb"],
    defaults: {
      photo: "arac-yol.png",
      photoPos: "center",
      scrim: "bottom-left",
      eyebrow: "Yabancı Plaka",
      title: "Türkiye'de **730 gün** kuralı",
      callout: "2026",
      calloutTone: "hot",
      align: "bottom",
    },
    fields: [
      { name: "photo", label: "Fotoğraf", type: "photo" },
      { name: "photoPos", label: "Fotoğraf konumu", type: "select", options: PHOTO_POS_OPTIONS },
      {
        name: "scrim",
        label: "Scrim",
        type: "select",
        options: [
          { value: "bottom-left", label: "Sol-alt" },
          { value: "bottom", label: "Alt" },
          { value: "full", label: "Tam" },
        ],
      },
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Başlık", type: "textarea", rows: 2, hint: "**sarı** · !!kırmızı!!" },
      { name: "callout", label: "Callout (köşe)", type: "text" },
      {
        name: "calloutTone",
        label: "Callout rengi",
        type: "select",
        options: [
          { value: "hot", label: "Kırmızı" },
          { value: "accent", label: "Sarı" },
        ],
      },
      {
        name: "align",
        label: "Metin hizası",
        type: "select",
        options: [
          { value: "bottom", label: "Alt" },
          { value: "center", label: "Orta" },
          { value: "top", label: "Üst" },
        ],
      },
    ],
  },
  "shorts-thumb": {
    type: "shorts-thumb",
    label: "Shorts Thumbnail",
    description: "9:16 dikey kapak — foto, scrim, büyük başlık.",
    dimensions: PHOTO_DIMENSIONS["shorts-thumb"],
    defaults: {
      photo: "arac-arazi.png",
      photoPos: "center",
      scrim: "bottom",
      eyebrow: "Dikkat",
      title: "En !!pahalı!! hata",
      callout: "ARAÇ MEN",
      calloutTone: "hot",
      align: "center",
    },
    fields: [
      { name: "photo", label: "Fotoğraf", type: "photo" },
      { name: "photoPos", label: "Fotoğraf konumu", type: "select", options: PHOTO_POS_OPTIONS },
      {
        name: "scrim",
        label: "Scrim",
        type: "select",
        options: [
          { value: "bottom", label: "Alt" },
          { value: "bottom-left", label: "Sol-alt" },
          { value: "full", label: "Tam" },
        ],
      },
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Başlık", type: "textarea", rows: 2, hint: "**sarı** · !!kırmızı!!" },
      { name: "callout", label: "Callout", type: "text" },
      {
        name: "calloutTone",
        label: "Callout rengi",
        type: "select",
        options: [
          { value: "hot", label: "Kırmızı" },
          { value: "accent", label: "Sarı" },
        ],
      },
      {
        name: "align",
        label: "Metin hizası",
        type: "select",
        options: [
          { value: "center", label: "Orta" },
          { value: "bottom", label: "Alt" },
          { value: "top", label: "Üst" },
        ],
      },
    ],
  },
};

export function defaultDocument(type: PhotoType): Record<string, unknown> {
  return { type, ...structuredCloneSafe(TEMPLATE_DEFS[type].defaults) };
}

// structuredClone is available in Node 18+/modern browsers, but guard anyway.
function structuredCloneSafe<T>(v: T): T {
  if (typeof structuredClone === "function") return structuredClone(v);
  return JSON.parse(JSON.stringify(v));
}
