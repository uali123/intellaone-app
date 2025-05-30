import * as React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  children: React.ReactNode;
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "none";
  animateEntrance?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = "lift",
  animateEntrance = true,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  const getHoverAnimation = () => {
    switch (hoverEffect) {
      case "lift":
        return { y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" };
      case "glow":
        return { boxShadow: "0 0 15px 2px rgba(var(--primary-rgb) / 0.3)" };
      case "border":
        return { border: "1px solid rgba(var(--primary-rgb) / 0.6)" };
      case "scale":
        return { scale: 1.02 };
      case "none":
      default:
        return {};
    }
  };

  return (
    <motion.div
      initial={animateEntrance ? { opacity: 0, y: 20 } : false}
      animate={animateEntrance ? { opacity: 1, y: 0 } : false}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: delay,
      }}
      whileHover={hoverEffect !== "none" ? getHoverAnimation() : undefined}
      className={cn("transition-all duration-300", className)}
    >
      <Card className="overflow-hidden" {...props}>
        {children}
      </Card>
    </motion.div>
  );
}