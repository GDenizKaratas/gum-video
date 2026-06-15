import React from 'react';
import { BrandTag } from './BrandTag.jsx';
import { LineIcon } from '../content/LineIcon.jsx';

/**
 * PostFrame — the fixed 1080×1080 navy canvas every Gümrükte Güncel
 * Instagram post is built on. Provides the brand field (navy + corner
 * vignette), an optional faint background motif (shipping routes /
 * scales), generous safe padding, and the standing corner BrandTag.
 *
 * Scale it to fit a viewport by wrapping in a container and applying
 * transform: scale(...) to the frame (see templates / cards).
 *
 * Pass `photo` to swap the navy field for a customs/trade photograph.
 * A navy brand-wash + a directional `scrim` gradient keep it cohesive
 * and keep the headline legible.
 */

const SCRIMS = {
  bottom:
    'linear-gradient(180deg, rgba(10,24,48,0) 0%, rgba(10,24,48,0.12) 40%, rgba(10,24,48,0.78) 78%, rgba(10,24,48,0.95) 100%)',
  top:
    'linear-gradient(0deg, rgba(10,24,48,0) 0%, rgba(10,24,48,0.12) 40%, rgba(10,24,48,0.78) 78%, rgba(10,24,48,0.95) 100%)',
  left:
    'linear-gradient(90deg, rgba(10,24,48,0.95) 0%, rgba(10,24,48,0.7) 38%, rgba(10,24,48,0.15) 72%, rgba(10,24,48,0) 100%)',
  full:
    'linear-gradient(180deg, rgba(10,24,48,0.72) 0%, rgba(10,24,48,0.58) 50%, rgba(10,24,48,0.82) 100%)',
};

function PhotoLayer({ photo, photoPos = 'center', scrim = 'bottom', grade = 0.46 }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img
        src={photo}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: photoPos,
        }}
      />
      {/* navy brand-wash: cools + unifies the photo toward the palette */}
      <div style={{ position: 'absolute', inset: 0, background: `rgba(15,34,68,${grade})` }} />
      {/* directional scrim for text legibility */}
      <div style={{ position: 'absolute', inset: 0, background: SCRIMS[scrim] || SCRIMS.bottom }} />
    </div>
  );
}

function Motif({ motif }) {
  if (motif === 'none') return null;
  const showRoutes = motif === 'routes' || motif === 'combo';
  const showScale = motif === 'scale' || motif === 'combo';
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {showRoutes && (
        <svg
          width="1080"
          height="1080"
          viewBox="0 0 1080 1080"
          fill="none"
          style={{ position: 'absolute', inset: 0 }}
        >
          <g stroke="var(--blue-motif)" strokeOpacity="0.5" strokeWidth="2">
            <path d="M-40 250 C 300 120, 760 180, 1140 60" strokeDasharray="3 14" strokeLinecap="round" />
            <path d="M-40 880 C 280 980, 820 900, 1140 1010" strokeDasharray="3 14" strokeLinecap="round" />
            <path d="M120 1140 C 240 700, 760 420, 1180 360" strokeDasharray="3 14" strokeLinecap="round" />
          </g>
          <g fill="var(--blue-motif)" fillOpacity="0.55">
            <circle cx="210" cy="196" r="5" />
            <circle cx="690" cy="156" r="5" />
            <circle cx="900" cy="936" r="5" />
            <circle cx="300" cy="930" r="5" />
            <circle cx="930" cy="402" r="5" />
          </g>
        </svg>
      )}
      {showScale && (
        <div style={{ position: 'absolute', right: '-60px', top: '90px', opacity: 0.06 }}>
          <LineIcon name="scale" size={420} color="var(--white)" strokeWidth={1.4} />
        </div>
      )}
    </div>
  );
}

export function PostFrame({
  children,
  motif,
  vignette = true,
  brand = true,
  handle,
  photo,
  photoPos = 'center',
  scrim = 'bottom',
  grade = 0.46,
  pad = 'var(--post-margin)',
  style,
  bodyStyle,
  ...rest
}) {
  const resolvedMotif = motif != null ? motif : photo ? 'none' : 'routes';
  return (
    <div
      style={{
        position: 'relative',
        width: 'var(--post-size)',
        height: 'var(--post-size)',
        background: 'var(--bg-base)',
        color: 'var(--text-display)',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {photo && <PhotoLayer photo={photo} photoPos={photoPos} scrim={scrim} grade={grade} />}
      {vignette && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(120% 120% at 50% 38%, transparent 40%, rgba(10,24,48,0.85) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}
      <Motif motif={resolvedMotif} />
      <div
        style={{
          position: 'relative',
          height: '100%',
          boxSizing: 'border-box',
          padding: pad,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', ...bodyStyle }}>
          {children}
        </div>
        {(brand || handle) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'var(--space-5)',
            }}
          >
            {brand ? <BrandTag /> : <span />}
            {handle && (
              <span
                style={{
                  fontSize: 'var(--fs-caption)',
                  color: 'var(--ink-faint)',
                  fontWeight: 'var(--fw-medium)',
                }}
              >
                {handle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
