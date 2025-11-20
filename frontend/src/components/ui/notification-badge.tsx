"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
    text: string;
    link: string;
    className?: string;
}

export function NotificationBadge({ text, link, className }: NotificationBadgeProps) {
    return (
        <div className={cn("inline-block", className)}>
            <Link href={link}>
                <div className="relative group inline-block">
                    {/* Main liquid glass container */}
                    <div className="relative inline-flex items-center gap-4 px-6 py-3 rounded-full glass-panel backdrop-blur-xl cursor-pointer transition-all duration-500 hover:scale-105 border border-white/20 dark:border-white/10">
                        {/* Animated background glow */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                        ></div>

                        {/* Live indicator with liquid effect */}
                        <div className="relative flex items-center justify-center">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping opacity-40"></div>
                                <div className="absolute -inset-1.5 w-5 h-5 bg-red-400/20 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Text content */}
                        <div className="relative">
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-500 tracking-wide">
                                {text}
                            </span>
                        </div>

                        {/* Animated arrow */}
                        <div className="relative flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                            <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
