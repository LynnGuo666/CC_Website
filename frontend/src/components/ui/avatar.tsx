"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

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

  // Generate cache key for localStorage
  const cacheKey = `avatar_${userId || username}`;
  
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

    // Check if image is cached in localStorage
    try {
      const cachedUrl = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const now = Date.now();
      
      // Cache for 24 hours
      const CACHE_DURATION = 24 * 60 * 60 * 1000;
      
      if (cachedUrl && cacheTime && (now - parseInt(cacheTime)) < CACHE_DURATION) {
        setImageUrl(cachedUrl);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
    }

    // Generate Minecraft avatar URL - prioritize username (nickname) over userId
    const identifier = username || userId;
    const mcHeadsUrl = `https://mc-heads.net/avatar/${identifier}/${size}`;
    
    // Simple check if the URL exists
    setImageUrl(mcHeadsUrl);
    
    // Cache the URL
    try {
      localStorage.setItem(cacheKey, mcHeadsUrl);
      localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache avatar URL:', error);
    }
    
    setIsLoading(false);
  }, [userId, username, size, cacheKey]);

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
          onError={() => setImageError(true)}
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