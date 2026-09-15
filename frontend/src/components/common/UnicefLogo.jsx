import React from 'react';

/**
 * Official UNICEF Logo Component
 * Displays the exact official UNICEF logo as provided, clean and uncluttered.
 */
export default function UnicefLogo({
  height = 48,
  style = {},
  className = '',
  variant = 'image' // 'image' | 'svg'
}) {
  if (variant === 'svg') {
    const aspectRatio = 450 / 160;
    const calculatedWidth = typeof height === 'number' ? height * aspectRatio : 'auto';
    return (
      <svg
        width={calculatedWidth}
        height={height}
        viewBox="0 0 450 160"
        className={`unicef-logo ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      >
        <g fill="#00AEEF">
          <path d="M 32 58 L 32 101 C 32 112 39 119 50 119 C 61 119 68 112 68 101 L 68 58 L 81 58 L 81 101 C 81 119 69 130 50 130 C 31 130 19 119 19 101 L 19 58 Z" />
          <path d="M 97 58 L 109 58 L 109 68 C 114 60 123 57 132 57 C 146 57 155 65 155 80 L 155 128 L 142 128 L 142 83 C 142 74 136 68 126 68 C 116 68 110 74 110 84 L 110 128 L 97 128 Z" />
          <rect x="171" y="38" width="13" height="13" rx="1.5" />
          <rect x="171" y="58" width="13" height="70" rx="1.5" />
          <path d="M 238 72 L 227 79 C 223 71 216 68 208 68 C 196 68 187 77 187 93 C 187 109 196 118 208 118 C 217 118 223 114 227 107 L 238 114 C 232 124 221 130 207 130 C 188 130 173 115 173 93 C 173 71 188 56 207 56 C 221 56 232 62 238 72 Z" />
          <path d="M 288 95 L 257 95 C 258 108 266 118 277 118 C 285 118 291 113 294 106 L 305 112 C 300 123 289 130 276 130 C 256 130 244 115 244 93 C 244 71 257 56 275 56 C 293 56 304 69 304 90 C 304 92 304 94 288 95 Z M 275 67 C 266 67 259 75 258 85 L 291 85 C 290 75 284 67 275 67 Z" />
          <path d="M 319 40 C 324 40 330 42 334 45 L 329 56 C 326 54 323 53 320 53 C 315 53 313 56 313 63 L 313 70 L 333 70 L 333 81 L 313 81 L 313 128 L 300 128 L 300 81 L 289 81 L 289 70 L 300 70 L 300 62 C 300 47 308 40 319 40 Z" />
        </g>
        <g transform="translate(390, 80) scale(0.68)">
          <path d="M -15 88 C -55 80 -95 40 -95 -15 C -95 -45 -80 -75 -55 -95 C -58 -85 -55 -70 -42 -60 C -52 -50 -55 -35 -48 -22 C -58 -10 -60 8 -50 22 C -58 35 -55 52 -42 64 C -50 74 -35 84 -15 88 Z" fill="#00AEEF" />
          <path d="M -75 -40 C -82 -32 -85 -18 -80 -8 C -86 2 -88 18 -80 28 C -86 38 -82 52 -70 62 C -80 48 -80 30 -75 15 C -80 0 -78 -20 -75 -40 Z" fill="#00AEEF" />
          <path d="M 15 88 C 55 80 95 40 95 -15 C 95 -45 80 -75 55 -95 C 58 -85 55 -70 42 -60 C 52 -50 55 -35 48 -22 C 58 -10 60 8 50 22 C 58 35 55 52 42 64 C 50 74 35 84 15 88 Z" fill="#00AEEF" />
          <path d="M 75 -40 C 82 -32 85 -18 80 -8 C 86 2 88 18 80 28 C 86 38 82 52 70 62 C 80 48 80 30 75 15 C 80 0 78 -20 75 -40 Z" fill="#00AEEF" />
          <circle cx="0" cy="-6" r="68" fill="none" stroke="#00AEEF" strokeWidth="3" />
          <ellipse cx="0" cy="-6" rx="68" ry="46" fill="none" stroke="#00AEEF" strokeWidth="2.2" />
          <ellipse cx="0" cy="-6" rx="68" ry="24" fill="none" stroke="#00AEEF" strokeWidth="2.2" />
          <line x1="-68" y1="-6" x2="68" y2="-6" stroke="#00AEEF" strokeWidth="2.2" />
          <line x1="0" y1="-74" x2="0" y2="62" stroke="#00AEEF" strokeWidth="2.2" />
          <path d="M 4 -12 C 14 -32 38 -36 48 -18 C 55 -4 55 18 42 32 C 32 42 12 48 -4 44 C -18 40 -26 28 -20 22 C -14 16 -8 24 4 24 C 18 24 30 16 32 2 C 34 -10 24 -20 12 -18 C 6 -17 2 -15 4 -12 Z" fill="#00AEEF" />
          <circle cx="36" cy="-14" r="17" fill="#00AEEF" />
          <circle cx="-16" cy="-10" r="14" fill="#00AEEF" />
          <path d="M -30 2 C -30 -2 -24 -4 -16 -4 C -8 -4 0 -2 0 6 C 0 16 -12 28 -24 28 C -30 28 -32 22 -30 14 C -28 6 -30 4 -30 2 Z" fill="#00AEEF" />
        </g>
      </svg>
    );
  }

  return (
    <img
      src="/unicef-logo.png"
      alt="UNICEF"
      className={`unicef-logo ${className}`}
      style={{
        height: height,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
      }}
      onError={(e) => {
        // Fallback to SVG if image not accessible
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/unicef-logo.svg';
      }}
    />
  );
}

