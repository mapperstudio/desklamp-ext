import { useState, useEffect } from 'react';
import { CupSoda } from 'lucide-react';

interface HydrationState {
  currentLiters: number;
  goalLiters: number;
  lastResetDate: string;
}

export default function Hydrate() {
  const [currentLiters, setCurrentLiters] = useState(0);
  const [goalLiters, setGoalLiters] = useState(2.0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load hydration state from worker on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getHydrationState' }, response => {
      if (response) {
        setCurrentLiters(response.currentLiters);
        setGoalLiters(response.goalLiters);
        setIsInitialized(true);
      }
    });
  }, []);

  // Save hydration state to worker when it changes
  useEffect(() => {
    if (!isInitialized) return;

    const state: HydrationState = {
      currentLiters,
      goalLiters,
      lastResetDate: new Date().toISOString().split('T')[0],
    };

    chrome.runtime.sendMessage({
      action: 'updateHydrationState',
      state: state,
    });
  }, [currentLiters, goalLiters, isInitialized]);

  const percentage = Math.round((currentLiters / goalLiters) * 100);

  const addWater = (amount: number) => {
    setCurrentLiters(prev => prev + amount);
  };

  return (
    <div className="flex flex-col rounded-xl border border-white/40 bg-white/40 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
      {/* Main content area */}
      <div className="flex flex-col gap-4 p-6 relative z-10">
        <div className="flex items-center gap-3">
          <CupSoda
            className={`size-6 ${percentage >= 100 ? 'text-white' : 'text-gray-800'}`}
          />
          <h2
            className={`text-lg font-medium leading-tight ${
              percentage >= 100 ? 'text-white' : 'text-gray-900'
            }`}
          >
            Stay Hydrated
          </h2>
        </div>

        {/* Large percentage display */}
        <div className="text-center py-4">
          <div
            className={`text-4xl font-semibold ${
              percentage >= 100 ? 'text-white' : 'text-gray-900'
            }`}
          >
            {percentage.toFixed(1)}%
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span
              className={`text-sm ${percentage >= 100 ? 'text-white' : 'text-gray-700'}`}
            >
              {percentage >= 100 ? 'Hydrated, well done! 💦' : 'Drink Up! 💧'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => addWater(0.2)}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-linear-to-r from-sky-100 to-sky-200 border-sky-400 border text-sky-500 font-bold shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <span className="truncate">+0.2L</span>
          </button>
          <button
            onClick={() => addWater(0.5)}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-linear-to-r from-sky-100 to-sky-200 border-sky-400 border text-sky-500 font-bold shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <span className="truncate">+0.5L</span>
          </button>
        </div>
      </div>

      {/* Dynamic blue progress section that grows from bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-blue-400 transition-all duration-500 ease-out"
        style={{
          height: `${percentage}%`,
          minHeight: percentage > 0 ? '40px' : '0px',
        }}
      >
        <div className="absolute bottom-4 left-6">
          <p
            className={`text-sm font-medium ${currentLiters === 0 ? 'text-gray-800' : 'text-white'}`}
          >
            {currentLiters.toFixed(1)} L{' '}
            {percentage >= 100
              ? `(+${(currentLiters - goalLiters).toFixed(1)}L extra)`
              : `of ${goalLiters.toFixed(1)} L`}
          </p>
        </div>
      </div>
    </div>
  );
}
