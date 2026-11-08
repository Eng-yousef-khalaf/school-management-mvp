import React from 'react';

export default function SchoolLogo({ size = 64, className = '', showText = false }) {
  return (
    <div className={`school-emblem-wrapper ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 10px rgba(79, 70, 229, 0.25))' }}
      >
        <defs>
          <linearGradient id="emblemBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Outer Circular Base */}
        <circle cx="60" cy="60" r="56" fill="url(#emblemBg)" stroke="url(#goldGradient)" strokeWidth="3" />
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Laurel Wreath / Olive Branches */}
        <g stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" fill="none">
          {/* Left Branch */}
          <path d="M 28 75 C 22 55 30 35 44 26" />
          <path d="M 27 68 C 21 64 21 57 26 56" fill="url(#goldGradient)" opacity="0.8" />
          <path d="M 26 54 C 20 49 22 42 28 42" fill="url(#goldGradient)" opacity="0.8" />
          <path d="M 31 40 C 27 34 32 28 38 29" fill="url(#goldGradient)" opacity="0.8" />
          <path d="M 39 30 C 37 23 44 20 48 23" fill="url(#goldGradient)" opacity="0.8" />

          {/* Right Branch */}
          <path d="M 92 75 C 98 55 90 35 76 26" />
          <path d="M 93 68 C 99 64 99 57 94 56" fill="url(#goldGradient)" opacity="0.8" />
          <path d="M 94 54 C 100 49 98 42 92 42" fill="url(#goldGradient)" opacity="0.8" />
          <path d="M 89 40 C 93 34 88 28 82 29" fill="url(#goldGradient)" opacity="0.8" />
          <path d="M 81 30 C 83 23 76 20 72 23" fill="url(#goldGradient)" opacity="0.8" />
        </g>

        {/* Torch / Flame of Wisdom */}
        <g>
          {/* Torch Handle */}
          <path d="M 58 56 L 62 56 L 61 72 L 59 72 Z" fill="url(#goldGradient)" />
          <path d="M 56 55 L 64 55 L 62 58 L 58 58 Z" fill="#d97706" />
          {/* Flame */}
          <path
            d="M 60 32 C 64 39 68 43 65 48 C 63 51 57 51 55 48 C 53 43 57 37 60 32 Z"
            fill="url(#flameGradient)"
          />
          <path
            d="M 60 38 C 62 42 63 44 62 47 C 61 49 59 49 58 47 C 57 44 59 40 60 38 Z"
            fill="#fef08a"
          />
        </g>

        {/* Open Book of Knowledge */}
        <g transform="translate(0, 10)">
          {/* Book Pages Base */}
          <path
            d="M 60 68 C 50 63 36 65 30 68 L 30 83 C 36 80 50 78 60 83 C 70 78 84 80 90 83 L 90 68 C 84 65 70 63 60 68 Z"
            fill="url(#bookGradient)"
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />
          {/* Center Spine */}
          <line x1="60" y1="68" x2="60" y2="83" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Left Page Lines */}
          <line x1="36" y1="72" x2="54" y2="70" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
          <line x1="36" y1="76" x2="52" y2="74" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
          {/* Right Page Lines */}
          <line x1="66" y1="70" x2="84" y2="72" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
          <line x1="68" y1="74" x2="84" y2="76" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Small Academic Cap on Top */}
        <g transform="translate(60, 20) scale(0.6) translate(-60, -20)">
          <polygon points="60,8 88,20 60,32 32,20" fill="url(#goldGradient)" />
          <polygon points="60,8 88,20 60,22 32,20" fill="#fef08a" opacity="0.6" />
          <path d="M 44 26 L 44 36 C 44 42 76 42 76 36 L 76 26" fill="none" stroke="url(#goldGradient)" strokeWidth="2" />
        </g>

        {/* Bottom Ribbon / Stars */}
        <g fill="url(#goldGradient)">
          <polygon points="60,98 62,103 67,103 63,106 65,111 60,108 55,111 57,106 53,103 58,103" />
          <polygon points="46,96 47.5,100 51.5,100 48.5,102.5 50,106.5 46,104 42,106.5 43.5,102.5 40.5,100 44.5,100" transform="scale(0.8) translate(8, 20)" />
          <polygon points="74,96 75.5,100 79.5,100 76.5,102.5 78,106.5 74,104 70,106.5 71.5,102.5 68.5,100 72.5,100" transform="scale(0.8) translate(22, 20)" />
        </g>
      </svg>

      {showText && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
            دولة فلسطين / وزارة التربية والتعليم
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>
            مدرسة يوسف للتربية والتعليم
          </div>
        </div>
      )}
    </div>
  );
}
