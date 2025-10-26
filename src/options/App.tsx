import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import SettingsLayout from './components/SettingsLayout';
import GeneralSettings from './pages/GeneralSettings';
import FocusSettings from './pages/FocusSettings';
import BreakSettings from './pages/BreakSettings';
import BlockedSitesSettings from './pages/BlockedSitesSettings';
import NotificationsSettings from './pages/NotificationsSettings';
import AboutSettings from './pages/AboutSettings';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-linear-to-br from-blue-100 via-indigo-100 to-sky-100 font-display">
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
          <div className="layout-container flex h-full grow flex-col">
            <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
              <div className="layout-content-container flex flex-col max-w-6xl flex-1">
                <Routes>
                  <Route path="/" element={<SettingsLayout />}>
                    <Route index element={<Navigate to="general" replace />} />
                    <Route path="general" element={<GeneralSettings />} />
                    <Route path="focus" element={<FocusSettings />} />
                    <Route path="break" element={<BreakSettings />} />
                    <Route
                      path="blocked-sites"
                      element={<BlockedSitesSettings />}
                    />
                    <Route
                      path="notifications"
                      element={<NotificationsSettings />}
                    />
                    <Route path="about" element={<AboutSettings />} />
                  </Route>
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}
