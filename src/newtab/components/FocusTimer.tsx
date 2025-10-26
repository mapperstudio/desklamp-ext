import { useState, useEffect } from 'react';
import { Minus, Plus, Hourglass, Pause, Play, RotateCcw } from 'lucide-react';
import { useFocusTimer } from '@/hooks/useFocusTimer';

export default function FocusTimer() {
  const [time, setTime] = useState(1500); // 25 minutes in seconds
  const [isInitialized, setIsInitialized] = useState(false);

  // Use the hook for timer display and state
  const {
    focusModeState,
    formattedTime,
    isActive,
    isPaused,
    startFocusMode,
    pauseFocusMode,
    stopFocusMode,
  } = useFocusTimer();

  // Load time setting on mount
  useEffect(() => {
    if (!isInitialized) {
      // Load time setting from worker on mount
      chrome.runtime.sendMessage({ action: 'getFocusModeState' }, response => {
        if (response) {
          setTime(response.time || 1500); // Default 25 minutes in seconds
          setIsInitialized(true);
        }
      });
    }
  }, [isInitialized]);

  // Save time setting when it changes
  useEffect(() => {
    if (isInitialized) {
      chrome.runtime.sendMessage({
        action: 'updateFocusModeState',
        state: {
          time,
          isActive: focusModeState?.isActive || false,
          sessionStartTime: focusModeState?.sessionStartTime || null,
          isPaused: focusModeState?.isPaused || false,
          originalDuration: focusModeState?.originalDuration || 0,
        },
      });
    }
  }, [time, isInitialized, focusModeState]);

  const incrementTime = () => {
    if (!isActive) {
      setTime(prev => Math.min(prev + 300, 3600)); // +5 minutes, max 60 minutes
    }
  };

  const decrementTime = () => {
    if (!isActive) {
      setTime(prev => Math.max(prev - 300, 300)); // -5 minutes, min 5 minutes
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const displayText = isActive ? formattedTime : formatTime(time);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/30 bg-white/50 backdrop-blur-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300 h-96 max-h-96 overflow-y-auto">
      <div className="flex items-center gap-3">
        <Hourglass className="text-gray-800 size-5" />
        <h2 className="text-gray-900 text-lg font-medium leading-tight">
          Focus Timer
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
        <div className="text-5xl font-medium bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
          {displayText}
        </div>

        {!isActive && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={decrementTime}
                className=" flex size-5 items-center justify-center rounded-full bg-transparent border border-blue-400 text-blue-400 font-medium shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <Minus className="text-blue-400 size-3" />
              </button>
              <p
                className="text-gray-400"
                onClick={() => {
                  // if local development, open the timer settings page
                  if (process.env.NODE_ENV === 'development') {
                    setTime(10);
                  }
                }}
              >
                Set timer
              </p>
              <button
                onClick={incrementTime}
                className=" flex size-5 items-center justify-center rounded-full bg-transparent border border-blue-400 text-blue-400 font-medium shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <Plus className="text-blue 400 size-3" />
              </button>
            </div>
          </div>
        )}

        {isActive && (
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={pauseFocusMode}
              className="flex-1 px-4 py-2 rounded-lg bg-linear-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="size-4" fill="white" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="size-4" fill="white" />
                  <span>Pause</span>
                </>
              )}
            </button>
            <button
              onClick={stopFocusMode}
              className="flex-1 px-4 py-2 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white/70 text-gray-700 font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RotateCcw className="size-4" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        {!isActive && (
          <button
            onClick={() => {
              startFocusMode(time);
            }}
            className="flex w-full  items-center justify-center overflow-hidden rounded-xl h-12 px-4 bg-linear-to-r from-blue-400 to-blue-600 text-white font-medium shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <span className="truncate">Start Focus Session</span>
          </button>
        )}
      </div>
    </div>
  );
}
