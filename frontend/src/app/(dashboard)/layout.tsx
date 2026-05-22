import Sidebar from '@/components/layout/SideBar';
import PresenceBootstrap from '@/components/realtime/PresenceBootstrap';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <PresenceBootstrap />
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-sidebar_width p-md md:p-lg lg:p-xl">
        {children}
      </main>
    </div>
  );
}
