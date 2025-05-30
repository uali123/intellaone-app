// Animation utility functions for consistent micro-interactions

// Subtle scale effect for clickable elements
export const scaleAnimation = {
  initial: { scale: 1 },
  hover: { scale: 1.03, transition: { duration: 0.2, ease: "easeInOut" } },
  tap: { scale: 0.97, transition: { duration: 0.1, ease: "easeInOut" } },
};

// Fade in animation for elements appearing on screen
export const fadeInAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
};

// Staggered children animations for lists
export const staggerContainerAnimation = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      delayChildren: 0.1 
    }
  },
};

// Item animation for staggered lists
export const staggerItemAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" } 
  },
};

// Pulse animation for notifications or highlights
export const pulseAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.05, 1],
    transition: { 
      duration: 0.5, 
      repeat: 1, 
      repeatType: "reverse",
      ease: "easeInOut" 
    } 
  },
};

// Subtle highlight animation
export const highlightAnimation = {
  initial: { backgroundColor: "transparent" },
  animate: { 
    backgroundColor: ["transparent", "rgba(59, 130, 246, 0.1)", "transparent"],
    transition: { 
      duration: 1,
      ease: "easeInOut",
    }
  },
};

// Rotate animation (for icons like refresh)
export const rotateAnimation = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: { duration: 0.6, ease: "easeInOut" } 
  },
};

// Success animation (checkmark appearance)
export const successAnimation = {
  initial: { opacity: 0, scale: 0.8, pathLength: 0 },
  animate: { 
    opacity: 1, 
    scale: 1,
    pathLength: 1,
    transition: { 
      duration: 0.5,
      ease: "easeOut" 
    } 
  },
};