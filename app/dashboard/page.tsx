import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';
import { getAuthToken } from '../auth';
import DashboardHomePage from './dashboard';

const ServerDashboardHomePage = async () => {
  const token = await getAuthToken();
  const preloadedNotes = await preloadQuery(api.notes.getNotes, {}, { token });

  return <DashboardHomePage preloadedNotes={preloadedNotes} />;
};

export default ServerDashboardHomePage;
