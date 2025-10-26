import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Focus from './pages/Focus';
import Break from './pages/Break';
import BreathingBreak from './pages/BreathingBreak';
import BreathingExercisePage from './pages/BreathingExercisePage';
import StretchBreak from './pages/StretchBreak';
import ExercisePage from './pages/ExercisePage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-linear-to-br from-blue-100 via-indigo-100 to-sky-100 font-display">
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
          <div className="layout-container flex h-full grow flex-col">
            <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center items-center">
              <div className="layout-content-container flex flex-col max-w-6xl flex-1">
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard/focus" replace />}
                  />
                  <Route path="/dashboard" element={<Dashboard />}>
                    <Route index element={<Navigate to="focus" replace />} />
                    <Route path="focus" element={<Focus />} />
                    <Route path="break" element={<Break />} />
                  </Route>
                  <Route path="/breathing-break" element={<BreathingBreak />} />
                  <Route
                    path="/breathing-exercise/:exerciseId"
                    element={<BreathingExercisePage />}
                  />
                  <Route path="/stretch-break" element={<StretchBreak />} />
                  <Route
                    path="/exercise/:exerciseId"
                    element={<ExercisePage />}
                  />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}
