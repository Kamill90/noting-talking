import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Add app-specific navigation or layout elements here */}
      {children}
    </div>
  );
}
