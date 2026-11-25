import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const textClass =
    variant === 'light'
      ? 'text-white'
      : 'text-[#10243A]';
  const fontSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconSize}
        aria-hidden="true"
      >
        <rect
          width="40"
          height="40"
          rx="10"
          fill={variant === 'light' ? '#0F9D83' : '#10243A'}
        />
        {/* Briefcase handle */}
        <path
          d="M15 13V11C15 9.89543 15.8954 9 17 9H23C24.1046 9 25 9.89543 25 11V13"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Briefcase body */}
        <rect
          x="8.5"
          y="13"
          width="23"
          height="17"
          rx="3"
          stroke="#FFFFFF"
          strokeWidth="2.2"
        />
        {/* Verification checkmark */}
        <path
          d="M15.5 21.5L18.5 24.5L25 18"
          stroke={variant === 'light' ? '#FFFFFF' : '#0F9D83'}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-bold tracking-tight ${fontSize} ${textClass}`} style={{ fontFamily: 'var(--font-display)' }}>
        KaziReady <span className={variant === 'light' ? 'text-teal-200' : 'text-[#0F9D83]'}>Garissa</span>
      </span>
    </span>
  );
}
