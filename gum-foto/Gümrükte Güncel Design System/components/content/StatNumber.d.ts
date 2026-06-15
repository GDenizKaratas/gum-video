import * as React from 'react';

export interface StatNumberProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The figure itself, e.g. "730" or "¼". Always rendered yellow. */
  value: React.ReactNode;
  /** Optional unit/suffix, e.g. "GÜN". */
  unit?: React.ReactNode;
  /** Color of the unit. Default 'accent'. */
  unitTone?: 'accent' | 'white';
  /** CSS font-size for the number. Default var(--fs-stat). */
  size?: string;
}

/** Oversized yellow hero figure (e.g. "730 GÜN"). One per post. */
export function StatNumber(props: StatNumberProps): React.JSX.Element;
