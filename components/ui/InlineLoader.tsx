import React from 'react';

interface InlineLoaderProps {
  text: string;
}

const InlineLoader: React.FC<InlineLoaderProps> = ({ text }) => {
  return (
    <div className="flex items-center space-x-2 my-4">
      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-600"></div>
      <span className="text-sm text-zinc-800 font-semibold">{text}</span>
    </div>
  );
};

export default InlineLoader;