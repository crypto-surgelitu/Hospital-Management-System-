import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  noPadding = false, 
  accent = null, // 'blue', 'violet', 'mint', 'amber'
  ...props 
}) {
  const accentClasses = {
    blue: 'border-l-4 border-[var(--color-module-blue)]',
    violet: 'border-l-4 border-[var(--color-module-violet)]',
    mint: 'border-l-4 border-[var(--color-module-mint)]',
    amber: 'border-l-4 border-[var(--color-module-amber)]',
  };

  return (
    <div
      className={`bg-[var(--color-surface-lowest)] rounded-[16px] editorial-shadow overflow-hidden transition-all duration-300 ${
        accent ? accentClasses[accent] : ''
      } ${
        noPadding ? '' : 'p-8 pb-10' // Increased bottom padding for asymmetric breathing room
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
