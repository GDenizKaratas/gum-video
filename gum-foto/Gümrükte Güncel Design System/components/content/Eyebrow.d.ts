import * as React from 'react';

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** 'accent' = yellow (date/news stamps); 'faint' = neutral. Default 'faint'. */
  tone?: 'faint' | 'accent';
  /** Show a short leading rule before the text. Default false. */
  rule?: boolean;
}

/** Small uppercase, wide-tracked label above a headline. */
export function Eyebrow(props: EyebrowProps): React.JSX.Element;
