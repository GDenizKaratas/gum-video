import * as React from 'react';

export interface TopicChipsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Topic labels, rendered uppercase and middot-separated. */
  items: string[];
  /** Text tone. Default 'faint'. */
  tone?: 'faint' | 'accent';
}

/** Standing topic row separated by yellow middots. */
export function TopicChips(props: TopicChipsProps): React.JSX.Element;
