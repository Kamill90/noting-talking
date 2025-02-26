import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  variant?: 'default' | 'destructive';
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  duration = 1000,
  onClose,
  variant = 'default',
  className
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 rounded-md px-4 py-2 text-sm shadow-lg",
      variant === 'default' ? 'bg-background border border-border text-foreground' : 'bg-destructive text-destructive-foreground',
      className
    )}>
      {message}
    </div>
  );
};
