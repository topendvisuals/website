'use client';

import { useState } from 'react';

interface FallbackImageProps {
  src: string;
  alt: string;
  gradientClassName: string; // tailwind "from-x via-y to-z" classes for the placeholder
  className?: string; // classes applied to whichever element renders (image or gradient)
  placeholderLabel?: string; // optional text shown only while the placeholder is showing
}

// Renders a real photo from /public/images if it exists. If the file hasn't
// been added yet (404), it quietly falls back to the brand gradient tile
// instead of a broken-image icon — so photos can be added one at a time
// without anything looking broken in the meantime.
export default function FallbackImage({
  src,
  alt,
  gradientClassName,
  className = '',
  placeholderLabel,
}: FallbackImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`relative bg-gradient-to-br ${gradientClassName} ${className}`} aria-hidden={!placeholderLabel}>
        {placeholderLabel && (
          <p className="absolute bottom-4 left-4 right-4 text-sm text-sand-100/80 font-body">
            {placeholderLabel}
          </p>
        )}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
