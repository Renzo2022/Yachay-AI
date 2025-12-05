import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';

function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-academic-bg/95 text-ink-strong">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen px-8 py-6 gap-6">
          <TopBar />
          <main className="flex-1 glass-panel p-8 overflow-y-auto border border-white/10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
