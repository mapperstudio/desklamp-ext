import Hydrate from './Hydrate';
import BreathingExercise from './BreathingExercise';
import StretchBreak from './StretchBreak';

export default function BreakSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <BreathingExercise />
      <StretchBreak />
      <Hydrate />
    </div>
  );
}
