import * as React from "react"
import { cn } from "@/lib/utils"

const GlassCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { variant?: "elevated" | "panel" }
>(({ className, variant = "elevated", ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                variant === "elevated" ? "glass-card" : "glass-panel",
                "text-card-foreground",
                className
            )}
            {...props}
        />
    )
})
GlassCard.displayName = "GlassCard"

export { GlassCard }
