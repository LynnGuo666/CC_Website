"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

type FloatingActionButtonProps = {
  href?: string;
  onClick?: () => void;
  title: string;
  icon: ReactNode;
  bottom?: number;
  right?: number;
};

/**
 * Render a floating action button using a portal so it always anchors
 * to the viewport regardless of the surrounding layout/transform context.
 */
export function FloatingActionButton({
  href,
  onClick,
  title,
  icon,
  bottom = 24,
  right = 24,
}: FloatingActionButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const className = "w-16 h-16 flex items-center justify-center rounded-full glass backdrop-blur-xl bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border border-primary/30 shadow-2xl hover:shadow-primary/30 hover:scale-110 hover:border-primary/50 transition-all duration-300 cursor-pointer";
  const style = {
    position: "fixed" as const,
    bottom,
    right,
    zIndex: 60,
  };

  const content = href ? (
    <Link
      href={href}
      aria-label={title}
      title={title}
      className={className}
      style={style}
    >
      {icon}
    </Link>
  ) : (
    <button
      onClick={onClick}
      aria-label={title}
      title={title}
      className={className}
      style={style}
    >
      {icon}
    </button>
  );

  return createPortal(content, document.body);
}
