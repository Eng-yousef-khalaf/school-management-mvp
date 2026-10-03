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
    const aspectRatio = 520 / 160;
    const calculatedWidth = typeof height === 'number' ? height * aspectRatio : 'auto';
    return (
      <svg
        width={calculatedWidth}
        height={height}
        viewBox="0 0 520 160"
        className={`unicef-logo ${className}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      >
        {/* Official UNICEF Wordmark with pristine letter spacing */}
        <text
          x="28"
          y="114"
          fill="#00AEEF"
          fontFamily="'Univers 65 Bold', 'Univers', 'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="90"
          fontWeight="bold"
          letterSpacing="1.5px"
        >
          unicef
        </text>
        <g transform="translate(425, 80) scale(0.68)">
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

