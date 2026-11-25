import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackLabel = 'KaziReady Garissa',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#10243A] to-[#1A3656] text-white p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Briefcase className="h-10 w-10 text-[#0F9D83] mb-3" />
        <p className="text-sm font-semibold tracking-tight">{fallbackLabel}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
