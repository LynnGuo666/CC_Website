import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                liquid: "liquid-btn text-foreground hover:text-primary",
                glass: "glass hover:bg-white/40 text-foreground border-white/20",
            },
            size: {
                default: "h-10 px-6 py-2 has-[>svg]:px-4 rounded-full",
                sm: "h-9 rounded-full gap-1.5 px-4 has-[>svg]:px-3",
                lg: "h-12 rounded-full px-8 has-[>svg]:px-6 text-base",
                icon: "size-10 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const LiquidButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "liquid", size, asChild = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                <span className="relative z-10 flex items-center gap-2">{children}</span>
                {variant === "liquid" && (
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                            background: "linear-gradient(120deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                            mixBlendMode: "overlay"
                        }}
                    ></div>
                )}
            </Comp>
        )
    }
)
LiquidButton.displayName = "LiquidButton"

export { LiquidButton, buttonVariants }
