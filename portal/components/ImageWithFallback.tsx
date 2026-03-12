'use client';

import { useEffect, useMemo, useState } from 'react';
import Image, { type ImageProps } from 'next/image';

const DEFAULT_FALLBACK_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

type ImageWithFallbackProps = Omit<ImageProps, 'src'> & {
  src: string | null | undefined;
  fallbackSrc?: string;
};

function normalizeSrc(value: string | null | undefined, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed !== '' ? trimmed : fallback;
}

export default function ImageWithFallback({
  src,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const resolvedFallback = useMemo(
    () => normalizeSrc(fallbackSrc, DEFAULT_FALLBACK_IMAGE),
    [fallbackSrc]
  );
  const primarySrc = useMemo(
    () => normalizeSrc(src, resolvedFallback),
    [src, resolvedFallback]
  );
  const [currentSrc, setCurrentSrc] = useState(primarySrc);

  useEffect(() => {
    setCurrentSrc(primarySrc);
  }, [primarySrc]);

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== resolvedFallback) {
          setCurrentSrc(resolvedFallback);
        }
        onError?.(event);
      }}
    />
  );
}
