import { Link } from 'react-router-dom';
import BreakSection from '../components/BreakSection';
import { Square, Target } from 'lucide-react';
import { useFocusTimer } from '@/hooks/useFocusTimer';

export default function Break() {
  const {
    focusModeState,
    remainingTime,
    formattedTime,
    isLoading,
    isActive,
    stopFocusMode,
  } = useFocusTimer();

  const handleTakeBreak = () => {
    stopFocusMode(); // Use the hook's stopFocusMode function
  };

  const isFocusActive =
    isActive && remainingTime > 0 && !focusModeState?.isPaused;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isFocusActive) {
    return (
      <div className="relative">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="text-center text-white">
            {/* Title */}
            <h2 className="text-lg font-bold mb-4">Focus Timer</h2>

            {/* Timer Display */}
            <div className="mb-8">
              <div className="text-5xl font-bold mb-3">{formattedTime}</div>
            </div>

            {/* Message */}
            <p className="text-white/90 mb-10 leading-relaxed text-lg max-w-md mx-auto">
              Taking a break now will end your focus timer. Are you sure you
              want to take a break?
            </p>

            {/* Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleTakeBreak}
                className=" px-8 py-3 bg-white/20 flex items-center gap-2 font-medium rounded-xl hover:bg-white/30 transition-colors border border-white/30"
              >
                <Square className="w-4 h-4 text-white" />
                <span className="text-white">Take Break</span>
              </button>
              <Link
                to="/dashboard/focus"
                className="px-8 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Keep Focusing
              </Link>
            </div>
          </div>
        </div>

        {/* Background content (blurred) */}
        <div className="blur-sm pointer-events-none">
          <BreakSection />
        </div>
      </div>
    );
  }

  return <BreakSection />;
}
