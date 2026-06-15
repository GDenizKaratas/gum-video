import React from 'react';
import { LineIcon } from './LineIcon.jsx';

/**
 * WarningStrip — the solid yellow band with navy text used for the
 * single hardest-hitting line on a warning post
 * (e.g. "Gümrük vergisinin ¼'ü ceza + araç men"). Optional leading
 * line icon. One per post.
 */
export function WarningStrip({ children, icon = 'alert', style, ...rest }) {
  return (
    <div
      style={{
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
        ...style,
      }}
      {...rest}
    >
      {icon && <LineIcon name={icon} size={56} color="var(--warn-ink)" strokeWidth={2.4} />}
      <span>{children}</span>
    </div>
  );
}
