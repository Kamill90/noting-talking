'use client';

import RecordingDesktop from '@/components/pages/recording/RecordingDesktop';
import { api } from '@/convex/_generated/api';
import { usePreloadedQueryWithAuth } from '@/lib/hooks';
import { Preloaded } from 'convex/react';

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


  return (
    <div className="mx-auto max-w-[1500px]">
      {currentNote.note === null ? (
        <div className="mt-10 text-center">
          <h1 className="text-4xl">Note not found</h1>
        </div>
      ) : (
        <>
          <RecordingDesktop
            {...currentNote}
            {...allCustomTranscriptions}
            customPoints={allCustomPoints}
          />
        </>

      )}
    </div>
  );
}
