import React from 'react';

/**
 * Highlight — the yellow "tweezers" accent. Wrap a SINGLE keyword or
 * number to draw the eye. Default is yellow text; 'fill' paints a
 * yellow block with navy ink for the strongest emphasis.
 * Rule: at most one Highlight per post (numbers excepted).
 */
export function Highlight({ children, variant = 'text', style, ...rest }) {
  if (variant === 'fill') {
    return (
      <span
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          fontWeight: 'var(--fw-extrabold)',
          padding: '0.02em 0.22em',
          borderRadius: '4px',
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
          ...style,
        }}
        {...rest}
      >
        {children}
      </span>
    );
  }
  return (
    <span style={{ color: 'var(--accent)', fontWeight: 'inherit', ...style }} {...rest}>
      {children}
    </span>
  );
}
