import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  noPadding = false, 
  accent = null,
  ...props 
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 ${noPadding ? '' : 'p-6'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}