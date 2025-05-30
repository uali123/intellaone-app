import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";

interface OnboardingTooltipProps {
  id?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  onClose?: () => void;
  onAction?: () => void;
  onComplete?: () => void;
  actionLabel?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  forceShow?: boolean;
}

export function OnboardingTooltip({
  id,
  title,
  description,
  children,
  onClose,
  onAction,
  onComplete,
  actionLabel = "Got it",
  position = "bottom",
  className,
  forceShow
}: OnboardingTooltipProps) {
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2"
  };

  // If forceShow is false, don't render anything
  if (forceShow === false) {
    return null;
  }

  // If children are provided, render them with the tooltip
  if (children) {
    return (
      <div className="relative" id={id}>
        {children}
        
        {forceShow && (
          <Card className={`absolute z-50 w-64 shadow-lg animate-fade-in ${positionClasses[position]} ${className}`}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Info className="w-4 h-4 mr-2 text-blue-500" />
                  <h4 className="font-medium text-sm">{title}</h4>
                </div>
                <button 
                  onClick={onComplete || onClose} 
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                {description}
              </p>
              
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  className="text-xs h-7 px-3"
                  onClick={onComplete || onAction}
                >
                  {actionLabel}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
  
  // Default tooltip without children
  return (
    <Card className={`absolute z-50 w-64 shadow-lg animate-fade-in ${positionClasses[position]} ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <Info className="w-4 h-4 mr-2 text-blue-500" />
            <h4 className="font-medium text-sm">{title}</h4>
          </div>
          {(onClose || onComplete) && (
            <button 
              onClick={onComplete || onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
          {description}
        </p>
        
        {(onAction || onComplete) && (
          <div className="flex justify-end">
            <Button 
              size="sm" 
              className="text-xs h-7 px-3"
              onClick={onComplete || onAction}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}