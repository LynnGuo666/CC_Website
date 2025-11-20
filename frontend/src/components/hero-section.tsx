import React from "react";

type HeroSectionProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function HeroSection({ title, subtitle, children, className }: HeroSectionProps) {
  return (
    <section className={`hero-section ${className || ''}`}>
      <div aria-hidden="true" className="absolute inset-0 hero-overlay refraction-layer"></div>
      <div className="hero-content space-y-6">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {children && (
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
