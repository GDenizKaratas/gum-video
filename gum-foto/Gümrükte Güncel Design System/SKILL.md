---
name: gumrukte-guncel-design
description: Use this skill to generate well-branded interfaces and assets for Gümrükte Güncel (a Turkish customs & foreign-trade information brand), either for production or throwaway prototypes/mocks/posts. Contains essential design guidelines, colors, type, fonts, assets, post components and Instagram post templates for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

This is a poster/social system: the core deliverable is **1080×1080 Instagram
posts** on a navy field, white type, and yellow used sparingly (numbers + one
keyword). Tone is formal-but-clear Turkish, never clickbait.

Key files:
- `readme.md` — full brand, content & visual foundations, iconography, index.
- `styles.css` — design tokens (colors, type, spacing) + the Archivo webfont.
- `components/` — React primitives: `PostFrame`, `BrandTag`, `Eyebrow`,
  `Highlight`, `StatNumber`, `TopicChips`, `WarningStrip`, `LineIcon`
  (each has a `.prompt.md` with usage).
- `templates/` — copyable post templates (welcome / value / warning / update).
- `posts/index.html` — the opening set of 4 example posts (tone + layout reference).
- `assets/` — logos (incl. transparent white wordmark) and banner.

If creating visual artifacts (posts, mocks, throwaway prototypes), copy assets
out and create static HTML files for the user to view. If working on production
code, copy assets and read the rules here to design as an expert in this brand.

If the user invokes this skill without other guidance, ask what they want to
build (e.g. which kind of post, news vs explainer), ask a few questions, and act
as an expert designer who outputs HTML artifacts or production code as needed.
