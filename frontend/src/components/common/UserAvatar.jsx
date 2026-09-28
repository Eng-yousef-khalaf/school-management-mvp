import React, { useState } from 'react';

/**
 * Universal UserAvatar component for Students, Teachers, Staff, and Principals.
 * Supports uploaded base64/image URLs, role-tailored high-aesthetic SVGs, and fallback initials.
 */
export default function UserAvatar({
  src = null,
  name = '',
  role = 'STUDENT', // 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN' | 'PARENT'
  gender = 'MALE',  // 'MALE' | 'FEMALE'
  size = 40,
  className = '',
  style = {},
  showRoleBadge = false
}) {
  const [hasError, setHasError] = useState(false);

  const cleanRole = (role || 'STUDENT').toUpperCase();
  const cleanGender = (gender || 'MALE').toUpperCase();

  // Role themes
  const roleConfig = {
    ADMIN: {
      bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: '#ffffff',
      border: '#6366f1',
      badgeIcon: '👔',
      badgeText: 'مدير',
      defaultEmoji: '👔',
      svgType: 'admin'
    },
    STAFF: {
      bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      color: '#ffffff',
      border: '#10b981',
      badgeIcon: '📋',
      badgeText: 'إداري',
      defaultEmoji: '📋',
      svgType: 'staff'
    },
    TEACHER: {
      bg: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
      color: '#ffffff',
      border: '#0ea5e9',
      badgeIcon: '👨‍🏫',
      badgeText: 'معلم',
      defaultEmoji: cleanGender === 'FEMALE' ? '👩‍🏫' : '👨‍🏫',
      svgType: cleanGender === 'FEMALE' ? 'teacher-f' : 'teacher-m'
    },
    STUDENT: {
      bg: cleanGender === 'FEMALE'
        ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#ffffff',
      border: cleanGender === 'FEMALE' ? '#f43f5e' : '#3b82f6',
      badgeIcon: '🎓',
      badgeText: 'طالب',
      defaultEmoji: cleanGender === 'FEMALE' ? '👧' : '👦',
      svgType: cleanGender === 'FEMALE' ? 'student-f' : 'student-m'
    },
    PARENT: {
      bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      color: '#ffffff',
      border: '#f59e0b',
      badgeIcon: '👨‍👧',
      badgeText: 'ولي أمر',
      defaultEmoji: '👨‍👧',
      svgType: 'parent'
    }
  };

  const currentTheme = roleConfig[cleanRole] || roleConfig.STUDENT;
  const initial = (name || '').trim().charAt(0) || currentTheme.defaultEmoji;

  const badgeSize = Math.max(14, Math.round(size * 0.38));

  return (
    <div
      className={`user-avatar-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        ...style
      }}
      title={name ? `${name} (${currentTheme.badgeText})` : currentTheme.badgeText}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${currentTheme.border}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: currentTheme.bg,
            color: currentTheme.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: Math.round(size * 0.42),
            border: `2px solid rgba(255,255,255,0.8)`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            userSelect: 'none'
          }}
        >
          {initial}
        </div>
      )}

      {showRoleBadge && (
        <span
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: badgeSize,
            height: badgeSize,
            borderRadius: '50%',
            background: '#ffffff',
            border: `1.5px solid ${currentTheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.round(badgeSize * 0.65),
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            zIndex: 2
          }}
        >
          {currentTheme.badgeIcon}
        </span>
      )}
    </div>
  );
}
