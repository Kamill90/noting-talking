import React from 'react';
import { cn } from '@/lib/utils';

interface InlineLoaderProps {
  text: string;
  className?: string;
}

const InlineLoader: React.FC<InlineLoaderProps> = ({ text, className }) => {
  return (
    <div className={cn("my-4 flex items-center space-x-2", className)}>
      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      <span className="text-sm font-semibold text-foreground">{text}</span>
    </div>
  );
};

export default InlineLoader;
