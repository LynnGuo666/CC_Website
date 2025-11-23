"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPublicApiBaseUrl } from '@/services/config';

interface AvatarProps {
  userId?: string | number;
  username?: string;
  className?: string;
  size?: number;
  fallbackLetter?: string;
  fallbackClassName?: string;
}

export function Avatar({
  userId,
  username,
  className = "",
  size = 40,
  fallbackLetter,
  fallbackClassName = ""
}: AvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useProxy, setUseProxy] = useState(false);

  // Generate cache key for localStorage - use both userId and username for uniqueness
  const cacheKey = `avatar_${userId ? `id_${userId}` : ''}${username ? `_user_${username}` : ''}`;
  
  useEffect(() => {
    if (!userId && !username) {
      setIsLoading(false);
      return;
    }

    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Reset states for fresh attempt
    setImageError(false);
    setUseProxy(false);

    // Check if image is cached in localStorage
    try {
      const cachedUrl = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const cachedSuccess = localStorage.getItem(`${cacheKey}_success`);
      const now = Date.now();

      // Cache for 48 hours
      const CACHE_DURATION = 48 * 60 * 60 * 1000;

      // Only use cache if the previous attempt was successful
      if (cachedUrl && cacheTime && cachedSuccess === 'true' && (now - parseInt(cacheTime)) < CACHE_DURATION) {
        setImageUrl(cachedUrl);
        setIsLoading(false);
        return;
      } else if (cachedUrl || cacheTime || cachedSuccess) {
        // Clear expired or failed cache
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(`${cacheKey}_time`);
        localStorage.removeItem(`${cacheKey}_success`);
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
    }

    // Generate Minecraft avatar URL - prioritize username (nickname) over userId
    const identifier = username || userId;
    const mcHeadsUrl = `https://mc-heads.net/avatar/${identifier}/${size}`;

    // Set the URL but don't cache yet (will cache on successful load)
    setImageUrl(mcHeadsUrl);

    setIsLoading(false);
  }, [userId, username, size, cacheKey]);

  // Handle successful image load - cache the URL
  const handleImageLoad = () => {
    if (imageUrl) {
      try {
        localStorage.setItem(cacheKey, imageUrl);
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        localStorage.setItem(`${cacheKey}_success`, 'true');
      } catch (error) {
        console.warn('Failed to cache avatar URL:', error);
      }
    }
  };

  // Handle image error - try proxy fallback
  const handleImageError = () => {
    // Clear any existing cache since this attempt failed
    try {
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_time`);
      localStorage.removeItem(`${cacheKey}_success`);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }

    if (!useProxy) {
      // First error: try using backend proxy
      const identifier = username || userId;
      const proxyBaseUrl = getPublicApiBaseUrl();
      const proxyUrl = `${proxyBaseUrl}/users/avatar/${identifier}/${size}`;
      setImageUrl(proxyUrl);
      setUseProxy(true);
      setImageError(false); // Reset error to try proxy
    } else {
      // Second error: show fallback avatar (don't cache this state)
      setImageError(true);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted animate-pulse ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-4 h-4 bg-muted-foreground/20 rounded"></div>
      </div>
    );
  }

  // Show Minecraft avatar if loaded successfully
  if (imageUrl && !imageError) {
    return (
      <div className={`overflow-hidden ${className}`} style={{ width: size, height: size }}>
        <Image
          src={imageUrl}
          alt={`${username || userId} avatar`}
          width={size}
          height={size}
          className="object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          unoptimized={true}
        />
      </div>
    );
  }

  // Fallback to text avatar
  const displayLetter = fallbackLetter || 
    (username ? username.charAt(0).toUpperCase() : 
     userId ? userId.toString().charAt(0) : '?');

  return (
    <div 
      className={`flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white font-bold ${fallbackClassName} ${className}`}
      style={{ 
        width: size, 
        height: size,
        fontSize: `${size / 2.5}px`
      }}
    >
      {displayLetter}
    </div>
  );
}
