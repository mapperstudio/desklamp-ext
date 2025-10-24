import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const isFocusActive = location.pathname === '/dashboard/focus';
  const isBreakActive = location.pathname === '/dashboard/break';

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-10">
      <div className="w-full">
        <div className="grid w-fit grid-cols-2 gap-0.5 bg-sky-200/50 backdrop-blur-lg border border-white/40 shadow-lg mx-auto rounded-full mb-6 p-0.5">
          <Link
            to="/dashboard/focus"
            className={`px-8 py-2 rounded-full font-medium transition-all duration-300 ${
              isFocusActive
                ? 'bg-white/60 text-gray-900'
                : 'text-gray-700 hover:bg-white/30'
            }`}
          >
            Focus
          </Link>
          <Link
            to="/dashboard/break"
            className={`px-8 py-2 rounded-full font-medium transition-all duration-300 ${
              isBreakActive
                ? 'bg-white/60 text-gray-900'
                : 'text-gray-700 hover:bg-white/30'
            }`}
          >
            Break
          </Link>
        </div>

        <Outlet />
      </div>
    </main>
  );
}
