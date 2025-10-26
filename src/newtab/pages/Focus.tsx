import TaskList from '../components/TaskList';
import SiteBlocker from '../components/SiteBlocker';
import FocusTimer from '../components/FocusTimer';

export default function Focus() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <TaskList />
      <FocusTimer />
      <SiteBlocker />
    </div>
  );
}
