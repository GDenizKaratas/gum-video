import React from 'react';

/**
 * BrandTag — the small, fixed corner brand label that appears on
 * every post: "Gümrükte Güncel". A thin yellow tick echoes the
 * wordmark's divider rule. The customs glyph is OFF by default (the
 * full-color 🛃 emoji clashes with the monochrome palette); opt in
 * with `customs` only where it genuinely helps.
 */
export function BrandTag({ customs = false, handle, color = 'var(--ink-muted)', style, ...rest }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          width: '22px',
          height: '4px',
          background: 'var(--accent)',
          borderRadius: '2px',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 'var(--fs-label)',
          fontWeight: 'var(--fw-semibold)',
          letterSpacing: '0.01em',
          color,
          whiteSpace: 'nowrap',
        }}
      >
        Gümrükte Güncel
        {customs && <span aria-hidden="true">🛃</span>}
      </span>
      {handle && (
        <span
          style={{
            fontSize: 'var(--fs-caption)',
            color: 'var(--ink-faint)',
            fontWeight: 'var(--fw-medium)',
            whiteSpace: 'nowrap',
          }}
        >
          {handle}
        </span>
      )}
    </div>
  );
}
