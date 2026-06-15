import React from 'react';

/**
 * StatNumber — the oversized yellow hero figure (e.g. "730 GÜN").
 * The number is always yellow; the unit/suffix is smaller and can be
 * yellow or white. This is the loudest element on a value post — one
 * per post, near the top.
 */
export function StatNumber({ value, unit, unitTone = 'accent', size = 'var(--fs-stat)', style, ...rest }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.18em',
        fontFamily: 'var(--font-display)',
        lineHeight: 'var(--lh-tight)',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          fontSize: size,
          fontWeight: 'var(--fw-black)',
          color: 'var(--accent)',
          letterSpacing: 'var(--tr-tight)',
        }}
      >
        {value}
      </span>
      {unit && (
        <span
          style={{
            fontSize: `calc(${size} * 0.34)`,
            fontWeight: 'var(--fw-extrabold)',
            letterSpacing: 'var(--tr-tight)',
            color: unitTone === 'accent' ? 'var(--accent)' : 'var(--ink-strong)',
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}
