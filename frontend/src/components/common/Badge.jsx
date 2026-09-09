import React from 'react';

export default function Badge({ status, label, type }) {
  const val = status || type || label || '';
  const normalized = String(val).toLowerCase();

  let className = `badge badge-${normalized}`;
  let display = label || status || type;

  if (normalized === 'active' || normalized === 'present') {
    className = 'badge badge-active';
  } else if (normalized === 'inactive' || normalized === 'absent') {
    className = 'badge badge-inactive';
  } else if (normalized === 'late') {
    className = 'badge badge-late';
  } else if (normalized === 'excused') {
    className = 'badge badge-excused';
  } else if (normalized === 'graduated') {
    className = 'badge badge-graduated';
  } else if (normalized === 'withdrawn') {
    className = 'badge badge-withdrawn';
  } else if (normalized === 'admin') {
    className = 'badge badge-admin';
  } else if (normalized === 'staff') {
    className = 'badge badge-staff';
  } else if (normalized === 'teacher') {
    className = 'badge badge-teacher';
  }

  return <span className={className}>{display}</span>;
}
