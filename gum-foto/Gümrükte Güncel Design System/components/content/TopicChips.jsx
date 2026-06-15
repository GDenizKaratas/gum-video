import React from 'react';

/**
 * TopicChips — the standing topic row, separated by middots
 * (e.g. İthalat • İhracat • Vergi • Lojistik • Mevzuat). Faint,
 * uppercase, evenly spaced. Used on the welcome / identity posts.
 */
export function TopicChips({ items = [], tone = 'faint', style, ...rest }) {
  const color = tone === 'accent' ? 'var(--accent)' : 'var(--ink-faint)';
  return (
    <div
      style={{
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
        ...style,
      }}
      {...rest}
    >
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" style={{ color: 'var(--accent)', opacity: 0.8 }}>
              •
            </span>
          )}
          <span>{it}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
