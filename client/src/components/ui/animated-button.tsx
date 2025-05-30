import * as React from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scaleAnimation } from "@/lib/animation-utils";

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
  withRipple?: boolean;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, withRipple = false, ...props }, ref) => {
    const [isRippling, setIsRippling] = React.useState(false);
    const [coords, setCoords] = React.useState({ x: -1, y: -1 });
    
    const rippleEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsRippling(true);
      
      setTimeout(() => setIsRippling(false), 500);
    };
    
    return (
      <motion.div
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={scaleAnimation}
        className={cn("relative overflow-hidden", className)}
      >
        <Button
          className={cn("relative", className)}
          ref={ref}
          onClick={withRipple ? rippleEffect : undefined}
          {...props}
        >
          {children}
          
          {withRipple && isRippling && (
            <span
              className="absolute bg-white/20 rounded-full animate-ripple"
              style={{
                left: coords.x,
                top: coords.y,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";