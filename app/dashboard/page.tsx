import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';
import { getAuthToken } from '../auth';
import DashboardHomePage from './dashboard';

const ServerDashboardHomePage = async () => {
  const token = await getAuthToken();
  const preloadedNotes = await preloadQuery(api.notes.getNotes, {}, { token });
  const preloadedCustomPoints = await preloadQuery(api.customPoints.getCustomPoints, {}, { token });

  return (
    <DashboardHomePage
      preloadedNotes={preloadedNotes}
      preloadedCustomPoints={preloadedCustomPoints}
    />
  );
};

export default ServerDashboardHomePage;
