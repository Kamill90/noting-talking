import { getAuthToken } from '@/app/auth';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { preloadQuery } from 'convex/nextjs';
import RecordingPage from './recording';

const Page = async ({ params: { id } }: { params: { id: Id<'notes'> } }) => {
  const token = await getAuthToken();
  const preloadedNote = await preloadQuery(api.notes.getNote, { id }, { token });
  const preloadedCustomPoints = await preloadQuery(api.customPoints.getCustomPoints, {}, { token });
  const preloadedCustomTranscriptions = await preloadQuery(
    api.customTranscriptions.getCustomTranscriptions,
    { id },
    { token },
  );

  return (
    <RecordingPage
      preloadedNote={preloadedNote}
      preloadedCustomPoints={preloadedCustomPoints}
      preloadedCustomTranscriptions={preloadedCustomTranscriptions}
    />
  );
};

export default Page;
