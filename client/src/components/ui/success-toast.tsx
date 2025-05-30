import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error";
  position?: "top-right" | "top-center" | "bottom-right";
}

export function SuccessToast({
  message,
  visible,
  onClose,
  duration = 3000,
  type = "success",
  position = "top-right",
}: SuccessToastProps) {
  const [progress, setProgress] = useState(0);
  
  // Position styles
  const positionStyles = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
  };
  
  // When visible, start progress timer
  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      
      if (now < endTime) {
        requestAnimationFrame(updateProgress);
      } else {
        onClose();
      }
    };
    
    const animationId = requestAnimationFrame(updateProgress);
    
    return () => cancelAnimationFrame(animationId);
  }, [visible, duration, onClose]);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed z-50 flex items-center p-4 pr-10 shadow-lg rounded-lg",
            position && positionStyles[position],
            type === "success" ? "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-700" : 
            "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-700"
          )}
          role="alert"
        >
          {/* Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, 0] }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {type === "success" ? (
              <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mr-3" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500 dark:text-red-400 mr-3" />
            )}
          </motion.div>
          
          {/* Message */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className={cn(
              "font-medium",
              type === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
            )}
          >
            {message}
          </motion.div>
          
          {/* Close button */}
          <button
            type="button"
            className="absolute top-1.5 right-1.5 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 14 14">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 12 12M13 1 1 13"
              />
            </svg>
          </button>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 overflow-hidden rounded-b-lg">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress * 100}%` }}
              className={cn(
                "h-full",
                type === "success" ? "bg-green-500/50" : "bg-red-500/50"
              )}
              style={{ 
                width: `${progress * 100}%`,
                transition: "width linear"
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}