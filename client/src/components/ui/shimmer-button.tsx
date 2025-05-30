import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const shimmerButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground relative overflow-hidden",
        secondary: "bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 text-white relative overflow-hidden",
        ghost: "hover:bg-accent hover:text-accent-foreground relative overflow-hidden",
        brand: "bg-gradient-to-r from-primary to-indigo-600 text-white relative overflow-hidden",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shimmerButtonVariants> {
  shimmerSize?: "full" | "partial";
  shimmerColor?: string;
  speed?: "slow" | "default" | "fast";
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size, 
    shimmerSize = "partial",
    shimmerColor = "rgba(255,255,255,0.2)",
    speed = "default",
    children,
    ...props 
  }, ref) => {
    const [isHovering, setIsHovering] = React.useState(false);
    
    const animationDuration = {
      slow: 3,
      default: 2,
      fast: 1,
    };
    
    const shimmerWidth = shimmerSize === "full" ? "100%" : "40%";
    
    return (
      <motion.button
        ref={ref}
        className={cn(shimmerButtonVariants({ variant, size, className }))}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {/* Shimmer overlay */}
        {isHovering && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              repeat: Infinity,
              duration: animationDuration[speed],
              ease: "linear",
            }}
            style={{
              width: shimmerWidth,
              background: `linear-gradient(to right, transparent, ${shimmerColor}, transparent)`,
            }}
          />
        )}
        
        {/* Text gradient that changes hue while hovering */}
        {variant === "ghost" && (
          <div className="absolute inset-0 opacity-0 hover:opacity-10 bg-gradient-to-r from-primary/50 via-purple-500/50 to-indigo-500/50 transition-opacity duration-300" />
        )}
        
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton, shimmerButtonVariants };