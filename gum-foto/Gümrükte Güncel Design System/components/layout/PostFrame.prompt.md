Fixed 1080×1080 navy post canvas; wrap every Gümrükte Güncel Instagram post in it.

```jsx
<PostFrame motif="routes" handle="@gumrukteguncel">
  <Eyebrow tone="accent" rule>2026 GÜNCEL</Eyebrow>
  <h1>…</h1>
</PostFrame>
```

- `motif`: `routes` (dashed shipping arcs, default), `scale` (faint terazi), `combo`, or `none`.
- `photo`: swap the navy field for a customs/trade photo. Pair with `scrim` (`bottom` default, `top`, `left`, `full`) for legibility and `photoPos` to frame it; `grade` (0–1) sets the navy wash strength.

```jsx
<PostFrame photo="../../assets/photos/liman-gemi.png" scrim="bottom" photoPos="center">
  <h1 style={{ marginTop: 'auto' }}>İhracatta yeni dönem</h1>
</PostFrame>
```

- Renders the standing `BrandTag` bottom-left automatically; pass `brand={false}` to hide.
- It's a fixed-size frame — scale it with `transform: scale()` inside a sized wrapper to fit a viewport.
