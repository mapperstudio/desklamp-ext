import FocusTimer from './FocusTimer';
import TaskList from './TaskList';
import SiteBlocker from './SiteBlocker';

export default function FocusSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <TaskList />
      <FocusTimer />
      <SiteBlocker />
    </div>
  );
}
