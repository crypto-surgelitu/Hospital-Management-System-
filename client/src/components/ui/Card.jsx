import React from 'react';

export default function Card({ children, className = '', noPadding = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-[16px] ghost-border shadow-sm overflow-hidden ${
        noPadding ? '' : 'p-6'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
