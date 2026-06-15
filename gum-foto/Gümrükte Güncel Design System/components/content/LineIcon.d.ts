import * as React from 'react';

export interface LineIconProps extends React.SVGProps<SVGSVGElement> {
  /** Which glyph to render. */
  name?: 'scale' | 'ship' | 'truck' | 'car' | 'document' | 'container' | 'globe' | 'alert';
  /** Pixel size (width = height). Default 48. */
  size?: number;
  /** Stroke color. Default currentColor. */
  color?: string;
  /** Stroke width. Default 2. */
  strokeWidth?: number;
}

/** Minimal stroked line icon (Lucide-derived) for accents and faint motifs. */
export function LineIcon(props: LineIconProps): React.JSX.Element;
