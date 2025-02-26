'use client';

import RecordingDesktop from '@/components/pages/recording/RecordingDesktop';
import { RecordingMobile } from '@/components/pages/recording/RecordingMobile';
import { api } from '@/convex/_generated/api';
import { usePreloadedQueryWithAuth } from '@/lib/hooks';
import { Preloaded } from 'convex/react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useEffect, useState } from 'react';

export default function RecordingPage({
  preloadedNote,
  preloadedCustomPoints,
  preloadedCustomTranscriptions,
}: {
  preloadedNote: Preloaded<typeof api.notes.getNote>;
  preloadedCustomPoints: Preloaded<typeof api.customPoints.getCustomPoints>;
  preloadedCustomTranscriptions: Preloaded<typeof api.customTranscriptions.getCustomTranscriptions>;
}) {
  const currentNote = usePreloadedQueryWithAuth(preloadedNote);
  const allCustomPoints = usePreloadedQueryWithAuth(preloadedCustomPoints);
  const allCustomTranscriptions = usePreloadedQueryWithAuth(preloadedCustomTranscriptions);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (currentNote.note === null) {
    return (
      <div className="mt-10 text-center">
        <h1 className="text-4xl">Note not found</h1>
      </div>
    );
  }

  // During SSR or before mounting, render the desktop version
  if (!isMounted) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <RecordingDesktop
          {...currentNote}
          {...allCustomTranscriptions}
          customPoints={allCustomPoints}
        />
      </div>
    );
  }

  // After mounting, render based on screen size
  if (isMobile) {
    return <RecordingMobile noteId={currentNote.note._id} />;
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <RecordingDesktop
        {...currentNote}
        {...allCustomTranscriptions}
        customPoints={allCustomPoints}
      />
    </div>
  );
}
