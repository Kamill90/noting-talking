import React from 'react';

interface InlineLoaderProps {
  text: string;
}

const InlineLoader: React.FC<InlineLoaderProps> = ({ text }) => {
  return (
    <div className="my-4 flex items-center space-x-2">
      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-sky-600"></div>
      <span className="text-sm font-semibold text-zinc-800">{text}</span>
    </div>
  );
};

export default InlineLoader;
