"use client";

import { useEffect, useState } from "react";

/**
 * Auto-sliding image crossfade — no external library
 * Only renders current + next image for performance
 */
export default function ImageSlider({
  images,
  interval = 4000,
  className = "",
  alt = "",
}: {
  images: string[];
  interval?: number;
  className?: string;
  alt?: string;
}) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(-1);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => {
        setPrev(c);
        return (c + 1) % images.length;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (!images.length) return null;
  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        width={800}
        height={600}
        className={`h-full w-full object-cover ${className}`}
        decoding="async"
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {prev >= 0 && (
        <img
          key={images[prev]}
          src={images[prev]}
          alt={`${alt} ${prev + 1}`}
          width={800}
          height={600}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out opacity-0 ${className}`}
        />
      )}
      <img
        key={images[current]}
        src={images[current]}
        alt={`${alt} ${current + 1}`}
        width={800}
        height={600}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out opacity-100 ${className}`}
      />
    </div>
  );
}
