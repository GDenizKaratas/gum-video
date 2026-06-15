import * as React from 'react';

export interface BrandTagProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the 🛃 customs emoji. Off by default — it renders full-color and clashes. */
  customs?: boolean;
  /** Optional handle shown after the name, e.g. "@gumrukteguncel". */
  handle?: string;
  /** Text color. Default var(--ink-muted). */
  color?: string;
}

/** The standing corner brand label: "Gümrükte Güncel 🛃". */
export function BrandTag(props: BrandTagProps): React.JSX.Element;
