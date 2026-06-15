import * as React from 'react';

export interface HighlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** 'text' = yellow text (default); 'fill' = yellow block, navy ink. */
  variant?: 'text' | 'fill';
}

/** The yellow "tweezers" accent — wrap a single keyword or number. */
export function Highlight(props: HighlightProps): React.JSX.Element;
