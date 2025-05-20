import React from 'react';

interface InlineLoaderProps {
  text: string;
}

const InlineLoader: React.FC<InlineLoaderProps> = ({ text }) => {
  return (
    <div className="my-4 flex items-center space-x-3 px-2 py-3">
      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-zinc-600"></div>
      <span className="text-sm font-medium text-zinc-700">{text}</span>
    </div>
  );
};

export default InlineLoader;
