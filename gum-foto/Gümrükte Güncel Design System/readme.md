# Gümrükte Güncel — Design System

A brand & content system for **Gümrükte Güncel** ("Up to date at customs"), a
Turkish customs & foreign-trade (gümrük ve dış ticaret) information brand. The
brand explains customs and trade legislation in plain, accurate, current
language across Instagram (feed posts) and YouTube.

This system exists to produce **on-brand 1080×1080 Instagram posts** — both
breaking-news ("güncel haber") items and evergreen explainer ("bilgilendirici")
posts — that feel professional and trustworthy, never clickbait, and never
"AI-generated". The aesthetic is poster logic, not slide logic: few words,
lots of breathing room, one confident idea per image.

## Sources provided

- `uploads/gumrukte-guncel.png` — stacked wordmark logo (white on navy), 1024².
- `uploads/gumrukte-guncel-banner.png` — channel banner: navy field, faint world
  map, dashed shipping routes, scales-of-justice (terazi) motifs, blue accent
  underline, topic line "Gümrük · İthalat · İhracat · Mevzuat".
- Written brief: brand identity, tone, format, and an opening set of 4 posts
  (welcome / value / warning / current). No codebase or Figma was attached —
  this system is derived from the two brand images + the written brief.

Derived, processed assets in `assets/`:

- `logo-stacked.png` — original logo (navy bg baked in).
- `logo-white.png` / `logo-white-tight.png` — wordmark knocked out to
  transparent white, for use on any navy shade.
- `banner.png` — original banner reference.

---

## CONTENT FUNDAMENTALS — how copy is written

**Language:** Turkish. Full Turkish typography matters (Ü Ğ İ ı Ş ç Ö) — the
chosen typeface must carry these glyphs. Use proper Turkish quotes/apostrophes
where natural (`Türkiye'de`, `¼'ü`).

**Voice:** _Resmî ama anlaşılır_ — formal but understandable. Authoritative,
calm, trustworthy. The brand is a knowledgeable guide, not a hype account.
Explicitly **not clickbait**: a hook can be sharp ("En pahalı hata") but the
payload is always factual and useful, never a cliffhanger for its own sake.

**Person:** Speaks to the reader as **"sen/siz"** when giving practical warnings
("Yabancı plakalı arabanı… bırakıp çıkarsan ne olur?"), and uses an institutional
**"biz"** for the brand's own promise ("…sade, doğru ve güncel anlatıyoruz",
"Detaylar YouTube kanalımızda"). Never first-person singular "ben".

**Length & rhythm:** Minimal. Poster, not slideshow ("Slayt değil, afiş mantığı").
A post is typically: one eyebrow/label + one short headline (≤ ~7 words) + one
or two lines of supporting copy. Let it breathe.

**Casing:**

- Wordmark & eyebrows/labels: **UPPERCASE** (`GÜMRÜKTE GÜNCEL`, `2026 GÜNCEL`).
- Headlines: **sentence case** ("Kurallar sürekli değişiyor",
  "Yabancı plakalı araç Türkiye'de ne kadar kalır?").
- Big stat units: uppercase ("730 **GÜN**").

**Emphasis:** Yellow is used like **tweezers (cımbızla)** — only on numbers and
**one** keyword per post. Never highlight a whole phrase.

**Emoji:** None. The brand is monochrome navy/white/yellow, and full-color
emoji (including the 🛃 customs glyph) clash with it — the standing corner tag
is plain "Gümrükte Güncel". A `customs` opt-in remains on `BrandTag` for rare
cases, but it is off by default.

**Punctuation:** Topic lists use middots: `İthalat • İhracat • Vergi • Lojistik
• Mevzuat`. Dates are explicit and formal ("27 Şubat 2026").

**Example copy (from the opening set):**

- Welcome: _"Gümrük ve dış ticaret mevzuatını sade, doğru ve güncel anlatıyoruz."_
- Value: _"Yabancı plakalı araç Türkiye'de ne kadar kalır?"_ → **730 GÜN**
- Warning strip: _"Gümrük vergisinin ¼'ü ceza + araç men"_
- Current: _"Kurallar sürekli değişiyor"_ / eyebrow _"2026 GÜNCEL"_

---

## VISUAL FOUNDATIONS

**Color.** A navy field carries everything. `--navy-800 #0F2244` is the primary
background; a corner **vignette** darkens toward `--navy-900 #0A1830` to focus
the centre. Type is white (`--ink-strong`) with two muted steps for hierarchy
(`--ink-muted` body, `--ink-faint` labels). The single accent is
**yellow `--accent #F5C518`**, rationed to numbers and one keyword. A muted
brand-blue (`--blue-motif`) exists _only_ for faint background motifs — never
for text or UI. A **thumbnail-only hot red `--yt-hot #E63A3F`** exists for
YouTube/Shorts click-contrast (one word or a small callout) and must **never**
appear on a feed post. No other hues. Avoid gradients as decoration (the only gradient
is the functional vignette).

**Type.** One family — **Archivo** — does all the work via weight and case.
Headlines are heavy (800/900) with tight tracking (`-0.02em`); eyebrows and the
wordmark are uppercase with wide tracking (`0.22em`). Scale is poster-sized
(hero numbers ~200px, headlines 84–108px, body ~40px) because everything is
authored at 1080². See _Typography_ cards. **Substitution flag:** Archivo is a
close stand-in for the original wordmark face (the source logo is rasterised);
confirm or send the real font file — see _Open questions_.

**Layout.** Fixed 1080×1080 canvas with a generous safe margin
(`--post-margin 96px`). Content is vertically composed (eyebrow → headline →
support) and left-aligned by default; the standing corner tag lives bottom-left.
8px spacing rhythm. Lots of negative space is a feature, not a gap to fill.

**Background / texture.** Subtle and earned, never busy: faint dashed
**great-circle shipping arcs** + a few node dots, optionally a single very-faint
**terazi (scale)** glyph echoing the banner. This is the brand's "özgün sade
doku" (original, plain texture) — it reads as professional cartography, not AI
gloss. Toggleable per post via `PostFrame motif`.

**Photo backgrounds.** A post may swap the navy field for a customs/trade
**photograph** (`PostFrame photo=…`): araç (caravan/araç), liman (container
ship), konteyner yard, etc. Two layers protect legibility and brand cohesion —
a flat **navy brand-wash** (`grade`, ~0.46) that cools and desaturates the image
toward the palette, then a directional **scrim** gradient (`scrim`:
`bottom`/`top`/`left`/`full`) toward navy-900 behind the text. Headlines get a
soft text-shadow. Photos are never shown raw or warm; they always read as part
of the navy system. Provide full-resolution frames for production (the sample
photos are 320×180 video stills).

**Shape & borders.** Mostly square / poster. Radii are restrained
(`--radius-sm 6px` on the warning strip and small blocks). Dividers are 2px
hairline rules (`--ink-ghost`) or short solid accent bars. The wordmark's own
horizontal divider rule is a recurring brand gesture (echoed by the yellow tick
in `BrandTag` and `Eyebrow rule`).

**Cards / panels.** This is a poster system, so "cards" are rare. When a block
is needed it's a flat navy panel (`--surface-panel`) with a 1px ghost border —
no drop shadows. The one filled element is the yellow `WarningStrip`.

**Shadows.** None decorative. The system relies on the navy/white/yellow
contrast, not elevation. (No drop shadows, no glows.)

**Motion / hover / press.** These are static export artifacts (Instagram
images), so there is **no animation, no hover, no press state** by default. If a
template is ever shown interactively, keep transitions minimal (short opacity
fades, no bounces).

**Imagery vibe.** No stock photography ("stok fotoğraf değil"). Visual support
is minimal **line iconography** (container, ship, document, vehicle, scale) at a
consistent 2px stroke — cool, monochrome, integrated into the navy field.

---

## ICONOGRAPHY

- **Set:** [Lucide](https://lucide.dev) (ISC licensed) — clean, uniform 2px
  stroke, round joins. It matches the brand's minimal line-icon requirement and
  covers the needed concepts: `scale` (terazi, the banner motif), `ship`,
  `truck`, `car` (araç silueti), `document` (file-text), `container` (package),
  `globe`, `alert` (triangle-alert).
- **Implementation:** the needed glyphs are embedded as path data inside the
  `LineIcon` component (no runtime CDN dependency, no hand-drawn SVG). Names map
  to Lucide originals; add more by copying their path data into `LineIcon.jsx`.
- **Usage:** sparing. Icons are texture/accent, not decoration — a faint
  background motif, a small inline mark, or the leading glyph on a
  `WarningStrip`. Default stroke 2; thinner (1.4) when used large and faint.
- **Emoji as icon:** only 🛃 in the corner brand tag. No other emoji or unicode
  symbols used as icons (middot `•` is a separator, not an icon).
- **Logo:** use `assets/logo-white-tight.png` on navy when a full wordmark
  lockup is needed; otherwise the typeset `BrandTag` is the standing mark.

---

## INDEX — what's in this system

**Foundations & tokens**

- `styles.css` — entry point (consumers link this); only `@import`s.
- `tokens/colors.css` · `tokens/typography.css` · `tokens/spacing.css` · `tokens/fonts.css`
- Specimen cards: `guidelines/*.card.html` (Type, Colors, Spacing, Brand).

**Components** (`window.GMrKteGNcelDesignSystem_500523.*` once the bundle is built)

- `components/layout/` — **PostFrame** (1080² canvas, navy or photo bg), **BrandTag** (corner label).
- `components/content/` — **Eyebrow**, **Highlight**, **StatNumber**,
  **TopicChips**, **WarningStrip**, **LineIcon**.
- `components/thumbnails/` — **VideoThumb** (YouTube 16:9 + Shorts 9:16) with
  **Y** / **Hot** emphasis-word helpers.
- Each has `.jsx` + `.d.ts` + `.prompt.md`; one `.card.html` per directory.

**Posts, thumbnails & templates**

- `posts/index.html` — the **opening set of 4** example posts (welcome, value,
  warning, current), the canonical reference for tone + layout.
- `editor.html` — tek bir arayüzden şablon seçip metin düzenleyebileceğin, canlı önizleme ve PNG indir seçeneği veren araç.
- `server.py` — editörü servis eden ve **output/ Klasörüne Kaydet** düğmesiyle
  üretilen PNG'leri doğrudan proje içindeki `output/` klasörüne yazan yerel
  sunucu. Çalıştır: `python3 server.py` → tarayıcı otomatik açılır
  (`http://127.0.0.1:8000/editor.html`).
- `templates/` — copyable starters, one folder each: post templates
  (`welcome-post/`, `value-post/`, `warning-post/`, `update-post/`,
  `photo-post/`), a multi-slide `carousel/`, and video thumbnails
  (`youtube-thumb/`, `shorts-thumb/`). Each loads the system via `ds-base.js`.

**Other**

- `assets/` — logos (original + transparent white), banner reference,
  `assets/photos/` (sample customs/trade stills for photo-background posts).
- `SKILL.md` — lets this folder be used as a downloadable Claude Agent Skill.

## Channel strategy — single post vs carousel vs video thumbnail

- **Single 1080² post** → news & warnings (güncel haber, mevzuat değişikliği,
  kısa uyarı). Fast to read and share; "afiş" logic. Templates: `update-post`,
  `warning-post`, `photo-post`.
- **Carousel** (3–6 slides) → educational / step-by-step ("nasıl işliyor", "X
  kuralının maddeleri"). Structure: cover (hook) → 2–4 explainer slides → CTA
  (YouTube). Higher dwell-time / engagement. Template: `carousel`.
- **YouTube thumbnail** (16:9) & **Shorts thumbnail** (9:16) → video covers.
  Big heavy headline, one emphasis word (`<Y>`/`<Hot>`), photo + light navy
  scrim. Keep Shorts text clear of the bottom ~320px and right edge (app UI).
  Templates: `youtube-thumb`, `shorts-thumb`.
- _Opening-set tip:_ posts 2 (730 gün) and 3 (en pahalı hata) are the same
  "yabancı plakalı araç" topic — combine them into one launch **carousel**
  (cover → 730 gün → en pahalı hata → CTA) rather than two separate posts.

## Open questions / substitutions (please confirm)

1. **Headline font.** Archivo is a close substitute for the wordmark face (the
   logo is a raster). If you have the real font file, send it and I'll embed it.
2. **Webfont delivery.** Archivo currently loads from Google Fonts. I can embed
   self-hosted woff2 binaries if you'd prefer no external dependency.
3. **Handle.** Templates show `@gumrukteguncel` as a placeholder — confirm the
   real Instagram handle.
