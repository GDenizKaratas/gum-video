/* @ds-bundle: {"format":3,"namespace":"GMrKteGNcelDesignSystem_500523","components":[{"name":"Eyebrow","sourcePath":"components/content/Eyebrow.jsx"},{"name":"Highlight","sourcePath":"components/content/Highlight.jsx"},{"name":"LineIcon","sourcePath":"components/content/LineIcon.jsx"},{"name":"StatNumber","sourcePath":"components/content/StatNumber.jsx"},{"name":"TopicChips","sourcePath":"components/content/TopicChips.jsx"},{"name":"WarningStrip","sourcePath":"components/content/WarningStrip.jsx"},{"name":"BrandTag","sourcePath":"components/layout/BrandTag.jsx"},{"name":"PostFrame","sourcePath":"components/layout/PostFrame.jsx"},{"name":"VideoThumb","sourcePath":"components/thumbnails/VideoThumb.jsx"},{"name":"Y","sourcePath":"components/thumbnails/VideoThumb.jsx"},{"name":"Hot","sourcePath":"components/thumbnails/VideoThumb.jsx"}],"sourceHashes":{"components/content/Eyebrow.jsx":"9bc09f28f99b","components/content/Highlight.jsx":"6421b5b8baa5","components/content/LineIcon.jsx":"11175539ee42","components/content/StatNumber.jsx":"18705281529b","components/content/TopicChips.jsx":"64fb12f8601f","components/content/WarningStrip.jsx":"8948d315183a","components/layout/BrandTag.jsx":"ac512c044053","components/layout/PostFrame.jsx":"f80e8454b5c5","components/thumbnails/VideoThumb.jsx":"d7f3bb75311d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GMrKteGNcelDesignSystem_500523 = window.GMrKteGNcelDesignSystem_500523 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/content/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Eyebrow — small uppercase, wide-tracked label that sits above a
 * headline (e.g. "2026 GÜNCEL"). Use 'accent' tone for date/news
 * stamps, 'faint' for neutral category labels.
 */
function Eyebrow({
  children,
  tone = 'faint',
  rule = false,
  style,
  ...rest
}) {
  const color = tone === 'accent' ? 'var(--accent)' : 'var(--ink-faint)';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '16px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-label)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--tr-eyebrow)',
      textTransform: 'uppercase',
      color,
      ...style
    }
  }, rest), rule && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: '40px',
      height: '3px',
      background: color,
      opacity: tone === 'accent' ? 1 : 0.6
    }
  }), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/content/Highlight.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Highlight — the yellow "tweezers" accent. Wrap a SINGLE keyword or
 * number to draw the eye. Default is yellow text; 'fill' paints a
 * yellow block with navy ink for the strongest emphasis.
 * Rule: at most one Highlight per post (numbers excepted).
 */
function Highlight({
  children,
  variant = 'text',
  style,
  ...rest
}) {
  if (variant === 'fill') {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        background: 'var(--accent)',
        color: 'var(--accent-ink)',
        fontWeight: 'var(--fw-extrabold)',
        padding: '0.02em 0.22em',
        borderRadius: '4px',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
        ...style
      }
    }, rest), children);
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      color: 'var(--accent)',
      fontWeight: 'inherit',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Highlight });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Highlight.jsx", error: String((e && e.message) || e) }); }

// components/content/LineIcon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * LineIcon — minimal stroked line icons for Gümrükte Güncel.
 * Sourced from the Lucide icon set (ISC licensed): clean 2px strokes,
 * round joins. Used sparingly as small accents or faint background motifs.
 */

const PATHS = {
  scale: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 21h10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3v18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"
  })),
  ship: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 10.189V14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 21c.6.5 1.2 1 2.5 1 1.3 0 1.9-.5 2.5-1 .6-.5 1.2-1 2.5-1 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 1.3 0 1.9-.5 2.5-1 .6-.5 1.2-1 2.5-1 1.3 0 1.9.5 2.5 1"
  })),
  truck: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 18H9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "18",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "18",
    r: "2"
  })),
  car: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "17",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 17h6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "17",
    r: "2"
  })),
  document: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v4a2 2 0 0 0 2 2h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 13H8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 17H8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 9H8"
  })),
  container: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 22V12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "3.29 7 12 12 20.71 7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m7.5 4.27 9 5.15"
  })),
  globe: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 12h20"
  })),
  alert: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  }))
};
function LineIcon({
  name = 'scale',
  size = 48,
  color = 'currentColor',
  strokeWidth = 2,
  style,
  ...rest
}) {
  const glyph = PATHS[name] || PATHS.scale;
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      display: 'block',
      flexShrink: 0,
      ...style
    }
  }, rest), glyph);
}
Object.assign(__ds_scope, { LineIcon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/LineIcon.jsx", error: String((e && e.message) || e) }); }

// components/content/StatNumber.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatNumber — the oversized yellow hero figure (e.g. "730 GÜN").
 * The number is always yellow; the unit/suffix is smaller and can be
 * yellow or white. This is the loudest element on a value post — one
 * per post, near the top.
 */
function StatNumber({
  value,
  unit,
  unitTone = 'accent',
  size = 'var(--fs-stat)',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '0.18em',
      fontFamily: 'var(--font-display)',
      lineHeight: 'var(--lh-tight)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size,
      fontWeight: 'var(--fw-black)',
      color: 'var(--accent)',
      letterSpacing: 'var(--tr-tight)'
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: `calc(${size} * 0.34)`,
      fontWeight: 'var(--fw-extrabold)',
      letterSpacing: 'var(--tr-tight)',
      color: unitTone === 'accent' ? 'var(--accent)' : 'var(--ink-strong)'
    }
  }, unit));
}
Object.assign(__ds_scope, { StatNumber });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/StatNumber.jsx", error: String((e && e.message) || e) }); }

// components/content/TopicChips.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TopicChips — the standing topic row, separated by middots
 * (e.g. İthalat • İhracat • Vergi • Lojistik • Mevzuat). Faint,
 * uppercase, evenly spaced. Used on the welcome / identity posts.
 */
function TopicChips({
  items = [],
  tone = 'faint',
  style,
  ...rest
}) {
  const color = tone === 'accent' ? 'var(--accent)' : 'var(--ink-faint)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '14px 22px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-chip)',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color,
      ...style
    }
  }, rest), items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: 'var(--accent)',
      opacity: 0.8
    }
  }, "\u2022"), /*#__PURE__*/React.createElement("span", null, it))));
}
Object.assign(__ds_scope, { TopicChips });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/TopicChips.jsx", error: String((e && e.message) || e) }); }

// components/content/WarningStrip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * WarningStrip — the solid yellow band with navy text used for the
 * single hardest-hitting line on a warning post
 * (e.g. "Gümrük vergisinin ¼'ü ceza + araç men"). Optional leading
 * line icon. One per post.
 */
function WarningStrip({
  children,
  icon = 'alert',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      background: 'var(--warn-fill)',
      color: 'var(--warn-ink)',
      padding: '26px 34px',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-h2)',
      fontWeight: 'var(--fw-extrabold)',
      letterSpacing: 'var(--tr-tight)',
      lineHeight: 'var(--lh-snug)',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.LineIcon, {
    name: icon,
    size: 56,
    color: "var(--warn-ink)",
    strokeWidth: 2.4
  }), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { WarningStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/WarningStrip.jsx", error: String((e && e.message) || e) }); }

// components/layout/BrandTag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * BrandTag — the small, fixed corner brand label that appears on
 * every post: "Gümrükte Güncel". A thin yellow tick echoes the
 * wordmark's divider rule. The customs glyph is OFF by default (the
 * full-color 🛃 emoji clashes with the monochrome palette); opt in
 * with `customs` only where it genuinely helps.
 */
function BrandTag({
  customs = false,
  handle,
  color = 'var(--ink-muted)',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      fontFamily: 'var(--font-body)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: '22px',
      height: '4px',
      background: 'var(--accent)',
      borderRadius: '2px',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: 'var(--fs-label)',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: '0.01em',
      color,
      whiteSpace: 'nowrap'
    }
  }, "G\xFCmr\xFCkte G\xFCncel", customs && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\uD83D\uDEC3")), handle && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--ink-faint)',
      fontWeight: 'var(--fw-medium)',
      whiteSpace: 'nowrap'
    }
  }, handle));
}
Object.assign(__ds_scope, { BrandTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/BrandTag.jsx", error: String((e && e.message) || e) }); }

// components/layout/PostFrame.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * PostFrame — the fixed 1080×1080 navy canvas every Gümrükte Güncel
 * Instagram post is built on. Provides the brand field (navy + corner
 * vignette), an optional faint background motif (shipping routes /
 * scales), generous safe padding, and the standing corner BrandTag.
 *
 * Scale it to fit a viewport by wrapping in a container and applying
 * transform: scale(...) to the frame (see templates / cards).
 *
 * Pass `photo` to swap the navy field for a customs/trade photograph.
 * A navy brand-wash + a directional `scrim` gradient keep it cohesive
 * and keep the headline legible.
 */

const SCRIMS = {
  bottom: 'linear-gradient(180deg, rgba(10,24,48,0) 0%, rgba(10,24,48,0.12) 40%, rgba(10,24,48,0.78) 78%, rgba(10,24,48,0.95) 100%)',
  top: 'linear-gradient(0deg, rgba(10,24,48,0) 0%, rgba(10,24,48,0.12) 40%, rgba(10,24,48,0.78) 78%, rgba(10,24,48,0.95) 100%)',
  left: 'linear-gradient(90deg, rgba(10,24,48,0.95) 0%, rgba(10,24,48,0.7) 38%, rgba(10,24,48,0.15) 72%, rgba(10,24,48,0) 100%)',
  full: 'linear-gradient(180deg, rgba(10,24,48,0.72) 0%, rgba(10,24,48,0.58) 50%, rgba(10,24,48,0.82) 100%)'
};
function PhotoLayer({
  photo,
  photoPos = 'center',
  scrim = 'bottom',
  grade = 0.46
}) {
  return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: photo,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: photoPos
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: `rgba(15,34,68,${grade})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: SCRIMS[scrim] || SCRIMS.bottom
    }
  }));
}
function Motif({
  motif
}) {
  if (motif === 'none') return null;
  const showRoutes = motif === 'routes' || motif === 'combo';
  const showScale = motif === 'scale' || motif === 'combo';
  return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none'
    }
  }, showRoutes && /*#__PURE__*/React.createElement("svg", {
    width: "1080",
    height: "1080",
    viewBox: "0 0 1080 1080",
    fill: "none",
    style: {
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement("g", {
    stroke: "var(--blue-motif)",
    strokeOpacity: "0.5",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M-40 250 C 300 120, 760 180, 1140 60",
    strokeDasharray: "3 14",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-40 880 C 280 980, 820 900, 1140 1010",
    strokeDasharray: "3 14",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M120 1140 C 240 700, 760 420, 1180 360",
    strokeDasharray: "3 14",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("g", {
    fill: "var(--blue-motif)",
    fillOpacity: "0.55"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "210",
    cy: "196",
    r: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "690",
    cy: "156",
    r: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "900",
    cy: "936",
    r: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "300",
    cy: "930",
    r: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "930",
    cy: "402",
    r: "5"
  }))), showScale && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: '-60px',
      top: '90px',
      opacity: 0.06
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.LineIcon, {
    name: "scale",
    size: 420,
    color: "var(--white)",
    strokeWidth: 1.4
  })));
}
function PostFrame({
  children,
  motif,
  vignette = true,
  brand = true,
  handle,
  photo,
  photoPos = 'center',
  scrim = 'bottom',
  grade = 0.46,
  pad = 'var(--post-margin)',
  style,
  bodyStyle,
  ...rest
}) {
  const resolvedMotif = motif != null ? motif : photo ? 'none' : 'routes';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      width: 'var(--post-size)',
      height: 'var(--post-size)',
      background: 'var(--bg-base)',
      color: 'var(--text-display)',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden',
      ...style
    }
  }, rest), photo && /*#__PURE__*/React.createElement(PhotoLayer, {
    photo: photo,
    photoPos: photoPos,
    scrim: scrim,
    grade: grade
  }), vignette && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(120% 120% at 50% 38%, transparent 40%, rgba(10,24,48,0.85) 100%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement(Motif, {
    motif: resolvedMotif
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
      padding: pad,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      ...bodyStyle
    }
  }, children), (brand || handle) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'var(--space-5)'
    }
  }, brand ? /*#__PURE__*/React.createElement(__ds_scope.BrandTag, null) : /*#__PURE__*/React.createElement("span", null), handle && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--ink-faint)',
      fontWeight: 'var(--fw-medium)'
    }
  }, handle))));
}
Object.assign(__ds_scope, { PostFrame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/PostFrame.jsx", error: String((e && e.message) || e) }); }

// components/thumbnails/VideoThumb.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VideoThumb — YouTube (16:9, 1280×720) and Shorts (9:16, 1080×1920)
 * thumbnail in the Gümrükte Güncel language: photo background, navy
 * scrim for legibility, left yellow accent bar, a small eyebrow chip,
 * a huge heavy headline (white with yellow/red emphasis words), an
 * optional callout pill, and the corner wordmark.
 *
 * Headlines use <Hot> / <Y> inside `title` via the `accent` segments,
 * but the simplest path is passing plain strings + `emphasis`.
 * Scale to fit by wrapping and transform: scale().
 */

const FORMATS = {
  youtube: {
    w: 1280,
    h: 720,
    pad: 60,
    title: 168,
    eyebrow: 38,
    callout: 56,
    bar: 16,
    gap: 22
  },
  shorts: {
    w: 1080,
    h: 1920,
    pad: 72,
    title: 184,
    eyebrow: 40,
    callout: 56,
    bar: 16,
    gap: 32
  }
};
const SCRIMS = {
  'bottom-left': 'linear-gradient(110deg, rgba(10,24,48,0.66) 0%, rgba(10,24,48,0.34) 38%, rgba(10,24,48,0.06) 68%, rgba(10,24,48,0) 100%), linear-gradient(0deg, rgba(10,24,48,0.52) 0%, rgba(10,24,48,0) 46%)',
  bottom: 'linear-gradient(0deg, rgba(10,24,48,0.66) 0%, rgba(10,24,48,0.24) 44%, rgba(10,24,48,0) 100%)',
  full: 'linear-gradient(180deg, rgba(10,24,48,0.42) 0%, rgba(10,24,48,0.28) 50%, rgba(10,24,48,0.5) 100%)'
};
function VideoThumb({
  format = 'youtube',
  photo,
  photoPos = 'center',
  scrim = 'bottom-left',
  grade = 0.18,
  eyebrow,
  title,
  callout,
  calloutTone = 'hot',
  brand = 'GÜMRÜKTE GÜNCEL',
  align = 'bottom',
  style,
  ...rest
}) {
  const F = FORMATS[format] || FORMATS.youtube;
  const justify = align === 'center' ? 'center' : align === 'top' ? 'flex-start' : 'flex-end';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      width: F.w,
      height: F.h,
      background: 'var(--bg-deep)',
      overflow: 'hidden',
      fontFamily: 'var(--font-display)',
      ...style
    }
  }, rest), photo && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    src: photo,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: photoPos
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: `rgba(15,34,68,${grade})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: SCRIMS[scrim] || SCRIMS['bottom-left']
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: F.bar,
      background: 'var(--accent)'
    }
  }), brand && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: F.pad,
      right: F.pad,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontSize: F.eyebrow,
      fontWeight: 'var(--fw-extrabold)',
      letterSpacing: '0.12em',
      color: 'var(--ink-strong)',
      textShadow: '0 2px 14px rgba(7,16,31,0.6)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 5,
      background: 'var(--accent)',
      borderRadius: 2
    }
  }), brand), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      boxSizing: 'border-box',
      padding: F.pad,
      paddingLeft: F.pad + F.bar,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      gap: F.gap
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: 'flex-start',
      background: 'var(--accent)',
      color: 'var(--accent-ink)',
      fontSize: F.eyebrow,
      fontWeight: 'var(--fw-extrabold)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '0.28em 0.7em',
      borderRadius: 'var(--radius-sm)'
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      maxWidth: format === 'shorts' ? '100%' : '92%',
      fontSize: F.title,
      fontWeight: 'var(--fw-black)',
      lineHeight: 0.92,
      letterSpacing: '-0.03em',
      color: 'var(--ink-strong)',
      textShadow: '0 4px 26px rgba(7,16,31,0.85), 0 2px 6px rgba(7,16,31,0.8), 0 0 2px rgba(7,16,31,0.7)',
      textWrap: 'balance'
    }
  }, title), callout && /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: 'flex-start',
      background: calloutTone === 'hot' ? 'var(--yt-hot)' : 'var(--accent)',
      color: calloutTone === 'hot' ? 'var(--yt-hot-ink)' : 'var(--accent-ink)',
      fontSize: F.callout,
      fontWeight: 'var(--fw-black)',
      letterSpacing: '-0.01em',
      padding: '0.2em 0.6em',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 10px 30px rgba(7,16,31,0.45)',
      transform: 'rotate(-2deg)'
    }
  }, callout)));
}

/** Yellow emphasis word for use inside a VideoThumb `title`. */
function Y({
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, children);
}

/** Red "hot" emphasis word for use inside a VideoThumb `title`. */
function Hot({
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--yt-hot)'
    }
  }, children);
}
Object.assign(__ds_scope, { VideoThumb, Y, Hot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/thumbnails/VideoThumb.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Highlight = __ds_scope.Highlight;

__ds_ns.LineIcon = __ds_scope.LineIcon;

__ds_ns.StatNumber = __ds_scope.StatNumber;

__ds_ns.TopicChips = __ds_scope.TopicChips;

__ds_ns.WarningStrip = __ds_scope.WarningStrip;

__ds_ns.BrandTag = __ds_scope.BrandTag;

__ds_ns.PostFrame = __ds_scope.PostFrame;

__ds_ns.VideoThumb = __ds_scope.VideoThumb;

__ds_ns.Y = __ds_scope.Y;

__ds_ns.Hot = __ds_scope.Hot;

})();
