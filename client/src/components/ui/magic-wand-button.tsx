import * as React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const magicWandVariants = cva("", {
  variants: {
    variant: {
      default: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white",
      outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 text-white",
      brand: "bg-primary hover:bg-primary/90 text-white",
    },
    size: {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3 text-sm",
      lg: "h-11 px-8 text-lg",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface MagicWandButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof magicWandVariants> {
  isLoading?: boolean;
  loadingText?: string;
  iconPosition?: "left" | "right";
  showParticles?: boolean;
}

export function MagicWandButton({
  className,
  variant = "default",
  size,
  isLoading = false,
  loadingText,
  iconPosition = "left",
  showParticles = true,
  disabled,
  children,
  ...props
}: MagicWandButtonProps) {
  const [particles, setParticles] = React.useState<Array<{ x: number; y: number; size: number; color: string; id: number }>>([]);
  const [isHovered, setIsHovered] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  // Generate random particles
  React.useEffect(() => {
    if (isHovered && showParticles) {
      const interval = setInterval(() => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const id = Math.random();
          
          // Randomize starting position along the button
          const x = Math.random() * rect.width;
          const y = Math.random() * rect.height;
          
          // Randomize particle color
          const colors = ["#f472b6", "#a78bfa", "#60a5fa"];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          setParticles(prev => [...prev, { id, x, y, size: 3 + Math.random() * 4, color }]);
          
          // Remove particle after animation completes
          setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
          }, 1000);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isHovered, showParticles]);
  
  const handleMouseEnter = () => {
    if (!disabled && !isLoading) {
      setIsHovered(true);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  return (
    <Button
      ref={buttonRef}
      className={cn(
        magicWandVariants({ variant, size }),
        "relative overflow-hidden group",
        className
      )}
      disabled={disabled || isLoading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Particles */}
      {particles.map(({ id, x, y, size, color }) => (
        <motion.span
          key={id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            left: x,
            top: y,
          }}
          initial={{ opacity: 1, scale: 0 }}
          animate={{ 
            opacity: [1, 0],
            scale: [0, 1.5],
            y: y - 40,
            x: x + (Math.random() * 20 - 10),
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
      
      {/* Shimmer overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      
      {/* Button content */}
      <div className="flex items-center justify-center relative z-10 gap-2">
        {iconPosition === "left" && !isLoading && (
          <Sparkles className="h-4 w-4 group-hover:animate-wiggle" />
        )}
        
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-white" />
            {loadingText || "Processing..."}
          </div>
        ) : (
          <span>{children}</span>
        )}
        
        {iconPosition === "right" && !isLoading && (
          <Sparkles className="h-4 w-4 group-hover:animate-wiggle" />
        )}
      </div>
    </Button>
  );
}