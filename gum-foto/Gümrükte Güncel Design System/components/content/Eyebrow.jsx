import React from 'react';

/**
 * Eyebrow — small uppercase, wide-tracked label that sits above a
 * headline (e.g. "2026 GÜNCEL"). Use 'accent' tone for date/news
 * stamps, 'faint' for neutral category labels.
 */
export function Eyebrow({ children, tone = 'faint', rule = false, style, ...rest }) {
  const color = tone === 'accent' ? 'var(--accent)' : 'var(--ink-faint)';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '16px',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-label)',
        fontWeight: 'var(--fw-bold)',
        letterSpacing: 'var(--tr-eyebrow)',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
      {...rest}
    >
      {rule && (
        <span
          aria-hidden="true"
          style={{ width: '40px', height: '3px', background: color, opacity: tone === 'accent' ? 1 : 0.6 }}
        />
      )}
      {children}
    </span>
  );
}
