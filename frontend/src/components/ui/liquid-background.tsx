"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  density: number;
  opacity: number;
}

export function LiquidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });

  // Initialize particles
  useEffect(() => {
    const particleCount = 40;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      newParticles.push({
        id: i,
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 4 + 2, // 2-6px dots
        density: (Math.random() * 20) + 10,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    setParticles(newParticles);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      setParticles(prevParticles =>
        prevParticles.map(p => {
          // Calculate distance from mouse (normalized to 0-100 scale roughly)
          // We need to convert mouse px to % roughly for interaction or keep px
          // Let's use a simple parallax effect for "following"
          // Actually user said "follow the mouse", so let's make them drift towards mouse slightly
          // or move WITH the mouse (parallax usually moves opposite, "follow" moves with)

          // Let's do a "magnetic" effect where they float towards mouse but stay anchored
          // Converting mouse px to percentage for simple logic
          const mouseXPercent = (mouse.current.x / window.innerWidth) * 100;
          const mouseYPercent = (mouse.current.y / window.innerHeight) * 100;

          const dx = mouseXPercent - p.baseX;
          const dy = mouseYPercent - p.baseY;

          // Move particle towards mouse based on density
          // The closer the mouse, the more they might cluster? 
          // Or just simple parallax: mouse moves right, particles move right (follow)
          const moveX = (mouseXPercent - 50) / p.density;
          const moveY = (mouseYPercent - 50) / p.density;

          return {
            ...p,
            x: p.baseX + moveX,
            y: p.baseY + moveY
          };
        })
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Liquid Glass Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30"></div>

      {/* Interactive Point Cloud */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/20 backdrop-blur-[1px] transition-transform duration-75 ease-out"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px rgba(var(--primary), 0.3)`
          }}
        />
      ))}

      {/* Animated liquid glass orbs (kept for depth) */}
      <div className="absolute inset-0 overflow-hidden opacity-60">
        <div
          aria-hidden="true"
          className="refraction-blob top-1/4 left-1/4 w-96 h-96 animate-pulse"
          style={
            {
              animation: 'liquid-flow 12s ease-in-out infinite',
              '--blob-primary': 'rgba(0, 113, 227, 0.25)',
              '--blob-secondary': 'rgba(52, 199, 89, 0.2)',
            } as React.CSSProperties
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
            } as React.CSSProperties
          }
        ></div>
      </div>
    </div>
  );
}
