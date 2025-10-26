import { Outlet, Link, useLocation } from 'react-router-dom';
import FloatingMenu from '../components/FloatingMenu';

export default function Dashboard() {
  const location = useLocation();
  const isFocusActive = location.pathname === '/dashboard/focus';
  const isBreakActive = location.pathname === '/dashboard/break';

  const handleSettingsClick = () => {
    // Open options page in a new tab
    chrome.runtime.openOptionsPage();
  };

  return (
    <main className="w-full">
      <Outlet />

      {/* Floating Navigation Tabs */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="grid w-fit grid-cols-2 gap-0.5 bg-blue-300/50 backdrop-blur-lg border border-white/40 shadow-xl rounded-full p-0.5">
          <Link
            to="/dashboard/focus"
            className={`px-8 py-2 rounded-full font-medium transition-all duration-300 ${
              isFocusActive
                ? 'bg-white/60 text-gray-700 shadow-lg'
                : 'text-gray-700 hover:bg-white/60'
            }`}
          >
            Focus
          </Link>
          <Link
            to="/dashboard/break"
            className={`px-8 py-2 rounded-full font-medium transition-all duration-300 ${
              isBreakActive
                ? 'bg-white/60 text-gray-700 shadow-lg'
                : 'text-gray-700 hover:bg-white/60'
            }`}
          >
            Break
          </Link>
        </div>
      </div>

      {/* Floating Menu */}
      <FloatingMenu onSettingsClick={handleSettingsClick} />
    </main>
  );
}
