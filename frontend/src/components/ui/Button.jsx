import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-[10px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-container)] focus:ring-[var(--color-primary)]',
    secondary:
      'bg-[var(--color-surface-low)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] focus:ring-[var(--color-outline-variant)]',
    danger:
      'bg-[var(--color-error)] text-white hover:opacity-90 focus:ring-[var(--color-error)]',
    ghost:
      'bg-transparent hover:bg-[var(--color-surface-low)] text-[var(--color-on-surface)] focus:ring-[var(--color-outline-variant)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <i className={`bi ${icon} ${children ? 'mr-2' : ''}`}></i>}
      {children}
    </button>
  );
}
