import { useState, useEffect, memo } from "react";
import { getOptimizedImageUrl, generateSrcSet } from "@/lib/imageOptimization";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export const ResponsiveImage = memo(({ 
  src, 
  alt, 
  className = "", 
  style,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw",
  priority = false,
  width,
  height
}: ResponsiveImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload priority images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = getOptimizedImageUrl(src, 800);
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  // Generate srcset with WebP support
  const srcSet = generateSrcSet(src);
  const optimizedSrc = getOptimizedImageUrl(src, 800);

  // Fallback to original if transformations fail
  if (hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
      />
    );
  }

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={`${className} ${isLoaded ? '' : 'animate-pulse bg-muted'}`}
      style={style}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      width={width}
      height={height}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
});

ResponsiveImage.displayName = 'ResponsiveImage';
