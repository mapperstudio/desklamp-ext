import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Settings,
  Focus,
  Coffee,
  Shield,
  Bell,
  Info,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  {
    path: '/general',
    label: 'General',
    icon: Settings,
  },
  {
    path: '/focus',
    label: 'Focus',
    icon: Focus,
  },
  {
    path: '/break',
    label: 'Break',
    icon: Coffee,
  },
  {
    path: '/blocked-sites',
    label: 'Blocked Sites',
    icon: Shield,
  },
  {
    path: '/notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    path: '/about',
    label: 'About',
    icon: Info,
  },
];

export default function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="flex h-full min-h-[600px] bg-white/60 backdrop-blur-lg border border-white/40 shadow-lg rounded-2xl overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-linear-to-b from-slate-50 to-slate-100 border-r border-slate-200/50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Settings</h1>
          <p className="text-slate-600 text-sm">
            Customize your DeskLamp experience
          </p>
        </div>

        <nav className="px-4 pb-6">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-200/50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-500 group-hover:text-slate-700'
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <ChevronRight
                        size={16}
                        className="ml-auto text-white/80"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
