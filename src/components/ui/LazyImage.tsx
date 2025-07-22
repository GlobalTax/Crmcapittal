
import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  fallback?: string;
}

export const LazyImage = React.memo<LazyImageProps>(({
  src,
  alt,
  className = '',
  placeholder,
  fallback = '/placeholder-image.svg'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(img);
    
    return () => observerRef.current?.disconnect();
  }, []);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };
  
  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        placeholder || (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )
      )}
      
      {isInView && (
        <img
          src={hasError ? fallback : src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';
