import * as React from 'react';

export interface PostFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Faint background motif. Default 'routes' (auto 'none' when a photo is set). */
  motif?: 'routes' | 'scale' | 'combo' | 'none';
  /** Corner-darkening vignette. Default true. */
  vignette?: boolean;
  /** Render the standing BrandTag bottom-left. Default true. */
  brand?: boolean;
  /** Optional handle shown bottom-right, e.g. "@gumrukteguncel". */
  handle?: string;
  /** Background photo URL (customs / trade imagery). Swaps the navy field. */
  photo?: string;
  /** CSS object-position for the photo. Default 'center'. */
  photoPos?: string;
  /** Direction of the navy legibility gradient over the photo. Default 'bottom'. */
  scrim?: 'bottom' | 'top' | 'left' | 'full';
  /** Flat navy brand-wash opacity over the photo (0–1). Default 0.46. */
  grade?: number;
  /** Inner safe padding (CSS length). Default var(--post-margin). */
  pad?: string;
  /** Extra styles applied to the body region. */
  bodyStyle?: React.CSSProperties;
}

/** Fixed 1080×1080 navy canvas — the base of every Gümrükte Güncel post. */
export function PostFrame(props: PostFrameProps): React.JSX.Element;
