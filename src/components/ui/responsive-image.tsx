import { useState } from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
}

const getSupabaseTransformUrl = (url: string, width: number, quality: number = 80): string => {
  // Check if it's a Supabase storage URL
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url;
  }
  
  // Transform: /storage/v1/object/public/ -> /storage/v1/render/image/public/
  const transformedUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );
  
  const separator = transformedUrl.includes('?') ? '&' : '?';
  return `${transformedUrl}${separator}width=${width}&quality=${quality}`;
};

export const ResponsiveImage = ({ 
  src, 
  alt, 
  className = "", 
  style,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
}: ResponsiveImageProps) => {
  const [hasError, setHasError] = useState(false);

  // Define breakpoints for srcset
  const widths = [400, 640, 800, 1024, 1280];
  
  // Generate srcset string
  const srcSet = widths
    .map(width => `${getSupabaseTransformUrl(src, width)} ${width}w`)
    .join(', ');

  // Fallback to original if transformations fail
  if (hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={getSupabaseTransformUrl(src, 800)}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};
