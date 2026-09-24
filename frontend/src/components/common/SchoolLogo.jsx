import React, { useState } from 'react';
import { useSchoolConfig } from '../../context/SchoolConfigContext';

export default function SchoolLogo({ size = 64, className = '', showText = false, customLogo = null, alt = 'School Logo' }) {
  let configLogoUrl = '';
  try {
    const { config } = useSchoolConfig();
    configLogoUrl = config?.logoUrl || '';
  } catch (e) {
    // Graceful fallback if rendered outside SchoolConfigProvider
  }

  const effectiveLogoUrl = customLogo || configLogoUrl || '/school-logo.png';
  const [imgError, setImgError] = useState(false);

  // If a custom logo exists and hasn't errored out, render the custom image
  if (effectiveLogoUrl && !imgError) {
    return (
      <div
        className={`school-emblem-wrapper ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          padding: 0,
          border: 'none'
        }}
      >
        <img
          src={effectiveLogoUrl}
          alt={alt}
          onError={() => setImgError(true)}
          style={{
            width: size,
            height: size,
            objectFit: 'contain',
            borderRadius: '50%',
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))',
            imageRendering: '-webkit-optimize-contrast',
            background: 'transparent',
            border: 'none',
            outline: 'none'
          }}
        />
        {showText && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
              دولة فلسطين / وزارة التربية والتعليم
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>
              مدرسة جذور النموذجية الخاصة
            </div>
          </div>
        )}
      </div>
    );
  }

  // Authentic Official School Emblem (Navy, 24K Gold, Pure White Book & Flame)
  return (
    <div
      className={`school-emblem-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 4px 10px rgba(15, 23, 42, 0.35))',
          imageRendering: '-webkit-optimize-contrast'
        }}
      >
        {/* Outer Circular Shield Base - Deep Royal Navy */}
        <circle cx="60" cy="60" r="56" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="3.5" />
        <circle cx="60" cy="60" r="50" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        {/* Golden Laurel Wreath / Olive Branches */}
        <g stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none">
          {/* Left Branch */}
          <path d="M 28 75 C 22 55 30 35 44 26" />
          <path d="M 27 68 C 21 64 21 57 26 56" fill="#f59e0b" />
          <path d="M 26 54 C 20 49 22 42 28 42" fill="#f59e0b" />
          <path d="M 31 40 C 27 34 32 28 38 29" fill="#f59e0b" />
          <path d="M 39 30 C 37 23 44 20 48 23" fill="#f59e0b" />

          {/* Right Branch */}
          <path d="M 92 75 C 98 55 90 35 76 26" />
          <path d="M 93 68 C 99 64 99 57 94 56" fill="#f59e0b" />
          <path d="M 94 54 C 100 49 98 42 92 42" fill="#f59e0b" />
          <path d="M 89 40 C 93 34 88 28 82 29" fill="#f59e0b" />
          <path d="M 81 30 C 83 23 76 20 72 23" fill="#f59e0b" />
        </g>

        {/* Torch / Flame of Wisdom */}
        <g>
          {/* Torch Handle */}
          <path d="M 58 54 L 62 54 L 61 70 L 59 70 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
          <path d="M 56 53 L 64 53 L 62 56 L 58 56 Z" fill="#d97706" />

          {/* Torch Flame */}
          <path
            d="M 60 30 C 65 37 68 42 65 47 C 63 50 57 50 55 47 C 52 42 56 35 60 30 Z"
            fill="#ef4444"
            stroke="#f97316"
            strokeWidth="1"
          />
          <path
            d="M 60 36 C 63 40 64 43 62 46 C 61 48 59 48 58 46 C 56 43 57 39 60 36 Z"
            fill="#fbbf24"
          />
          <circle cx="60" cy="43" r="2.5" fill="#ffffff" />
        </g>

        {/* Open Book of Knowledge */}
        <g transform="translate(0, 8)">
          {/* Book Pages Base Fill - Crisp Pure White */}
          <path
            d="M 60 67 C 49 61 34 63 26 66 L 26 83 C 34 80 49 78 60 84 C 71 78 86 80 94 83 L 94 66 C 86 63 71 61 60 67 Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          {/* Center Spine */}
          <line x1="60" y1="67" x2="60" y2="84" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />

          {/* Left Page Text Lines */}
          <line x1="33" y1="71" x2="53" y2="69" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="33" y1="75" x2="51" y2="73" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="35" y1="79" x2="48" y2="77" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

          {/* Right Page Text Lines */}
          <line x1="67" y1="69" x2="87" y2="71" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="69" y1="73" x2="87" y2="75" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="72" y1="77" x2="85" y2="79" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Small Academic Cap on Top */}
        <g transform="translate(60, 18) scale(0.65) translate(-60, -18)">
          <polygon points="60,6 88,18 60,30 32,18" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
          <polygon points="60,6 88,18 60,20 32,18" fill="#fbbf24" opacity="0.6" />
          <path d="M 44 24 L 44 34 C 44 40 76 40 76 34 L 76 24" fill="none" stroke="#f59e0b" strokeWidth="2" />
        </g>

        {/* Bottom Ribbon / Golden Stars */}
        <g fill="#fbbf24" stroke="#d97706" strokeWidth="0.8">
          <polygon points="60,98 62.5,103 68,103 63.5,106.5 65.5,112 60,108.5 54.5,112 56.5,106.5 52,103 57.5,103" />
          <polygon points="44,95 46,99 50.5,99 47,101.5 48.5,106 44,103.5 39.5,106 41,101.5 37.5,99 42,99" />
          <polygon points="76,95 78,99 82.5,99 79,101.5 80.5,106 76,103.5 71.5,106 73,101.5 69.5,99 74,99" />
        </g>
      </svg>

      {showText && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
            دولة فلسطين / وزارة التربية والتعليم
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>
            المنظومة الأكاديمية الذكية
          </div>
        </div>
      )}
    </div>
  );
}
