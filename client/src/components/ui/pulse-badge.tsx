import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { motion } from "framer-motion";

const pulseVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border-border text-foreground",
      success: "bg-green-500 text-white",
      warning: "bg-amber-500 text-white",
      info: "bg-blue-500 text-white",
    },
    size: {
      default: "h-6 px-2.5 text-xs",
      sm: "h-5 px-1.5 text-[10px]",
      lg: "h-7 px-3 text-sm",
    },
    pulse: {
      none: "",
      subtle: "after:bg-current after:opacity-40 after:blur-sm",
      strong: "after:bg-current after:opacity-70 after:blur-md",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    pulse: "none",
  },
});

export interface PulseBadgeProps 
  extends Omit<BadgeProps, 'variant'>, 
    VariantProps<typeof pulseVariants> {
  animate?: boolean;
  count?: number;
  max?: number;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
}

export function PulseBadge({ 
  className, 
  variant = "default", 
  size, 
  pulse = "none",
  animate = false,
  count,
  max = 99,
  ...props
}: PulseBadgeProps) {
  const displayCount = count !== undefined 
    ? count > max 
      ? `${max}+` 
      : count.toString()
    : undefined;

  // No animation if just a normal badge without count
  if (!animate || count === undefined) {
    return (
      <Badge 
        className={cn(
          pulseVariants({ variant, size, pulse, className }),
          pulse !== "none" && "relative after:absolute after:inset-0 after:rounded-full after:animate-pulse-badge after:z-[-1]",
        )}
        {...props}
      >
        {displayCount || props.children}
      </Badge>
    );
  }

  // For zero count, you might not want to show
  if (count === 0) return null;

  // Generate color class based on variant
  const getColorClass = () => {
    if (variant === "outline") return "bg-border";
    if (variant === "secondary") return "bg-secondary";
    if (variant === "success") return "bg-green-500";
    if (variant === "warning") return "bg-amber-500";
    if (variant === "info") return "bg-blue-500";
    if (variant === "destructive") return "bg-destructive";
    return "bg-primary";
  };

  return (
    <div className="relative inline-flex">
      <Badge 
        className={cn(
          pulseVariants({ variant, size, pulse, className }),
          pulse !== "none" && "relative after:absolute after:inset-0 after:rounded-full after:animate-pulse-badge after:z-[-1]",
        )}
        {...props}
      >
        {displayCount || props.children}
      </Badge>
      
      {animate && (
        <motion.span
          className={cn(
            "absolute top-0 right-0 h-full w-full rounded-full opacity-75",
            getColorClass()
          )}
          initial={{ scale: 0.5, opacity: 0.5 }}
          animate={{ 
            scale: [0.5, 1.2, 0.5], 
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      )}
    </div>
  );
}