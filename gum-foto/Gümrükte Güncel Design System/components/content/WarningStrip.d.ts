import * as React from 'react';

export interface WarningStripProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Leading LineIcon name, or null to hide. Default 'alert'. */
  icon?: string | null;
}

/** Solid yellow band with navy text — the single hardest line of a warning post. */
export function WarningStrip(props: WarningStripProps): React.JSX.Element;
