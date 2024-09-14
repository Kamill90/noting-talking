import Header from '@/components/ui/Header';
import { RecordingPanel } from '@/app/RecordingPanel';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      <RecordingPanel />
      {children}
    </div>
  );
};

export default DashboardLayout;
