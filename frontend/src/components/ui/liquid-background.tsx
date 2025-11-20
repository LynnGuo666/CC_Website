"use client";

import React, { CSSProperties } from 'react';

export function LiquidBackground() {
  return (
    <>
      {/* Liquid Glass Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 -z-10"></div>

      {/* Animated liquid glass orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          aria-hidden="true"
          className="refraction-blob top-1/4 left-1/4 w-96 h-96 animate-pulse"
          style={
            {
              animation: 'liquid-flow 12s ease-in-out infinite',
              '--blob-primary': 'rgba(0, 113, 227, 0.25)',
              '--blob-secondary': 'rgba(52, 199, 89, 0.2)',
            } as CSSProperties
          }
        ></div>
        <div
          aria-hidden="true"
          className="refraction-blob bottom-1/4 right-1/4 w-96 h-96 animate-pulse"
          style={
            {
              animation: 'liquid-flow 15s ease-in-out infinite reverse',
              '--blob-primary': 'rgba(52, 199, 89, 0.25)',
              '--blob-secondary': 'rgba(0, 113, 227, 0.2)',
            } as CSSProperties
          }
        ></div>
        <div
          aria-hidden="true"
          className="refraction-blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
          style={
            {
              animation: 'liquid-flow 20s linear infinite',
              '--blob-primary': 'rgba(175, 82, 222, 0.2)',
              '--blob-secondary': 'rgba(0, 113, 227, 0.2)',
            } as CSSProperties
          }
        ></div>
      </div>
    </>
  );
}
