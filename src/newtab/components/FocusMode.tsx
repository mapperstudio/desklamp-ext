import { useState, useEffect } from 'react';
import { Minus, Plus, Target, Play, Square, Pause } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFocusTimer } from '@/hooks/useFocusTimer';

export default function FocusMode() {
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
    <div className="flex flex-col gap-4 rounded-xl border border-white/40 bg-white/40 backdrop-blur-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300 h-96 max-h-96 overflow-y-auto">
      <div className="flex items-center gap-3">
        <Target className="text-gray-800 size-5" />
        <h2 className="text-gray-900 text-lg font-medium leading-tight">
          Focus Mode
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
        <div
          className={`text-5xl font-medium ${isActive ? 'text-gray-700' : 'text-gray-600'}`}
        >
          {displayText}
        </div>

        {!isActive && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={decrementTime}
                className="cursor-pointer flex size-5 items-center justify-center rounded-full bg-gray-400 text-white font-medium shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <Minus className="text-white size-3" />
              </button>
              <p
                className="text-gray-500"
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
                className="cursor-pointer flex size-5 items-center justify-center rounded-full bg-gray-400 text-white font-medium shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <Plus className="text-white size-3" />
              </button>
            </div>
          </div>
        )}

        {isActive && (
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={pauseFocusMode}
                  className="cursor-pointer flex size-8 items-center justify-center rounded-full hover:scale-110 transition-all duration-300"
                >
                  {isPaused ? (
                    <Play className="text-gray-600 size-5" />
                  ) : (
                    <Pause className="text-gray-600 size-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isPaused ? 'Resume' : 'Pause'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={stopFocusMode}
                  className="cursor-pointer flex size-8 items-center justify-center rounded-full hover:scale-110 transition-all duration-300"
                >
                  <Square className="text-gray-600 size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Stop Focus Mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        {!isActive && (
          <button
            onClick={() => {
              startFocusMode(time);
            }}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-4 bg-linear-to-r from-gray-400 to-gray-600 text-white font-medium shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <span className="truncate">Start Focus Session</span>
          </button>
        )}

        {isActive && (
          <div className="text-center">
            <p
              className={`text-sm ${isPaused ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {isPaused ? 'Paused' : 'Keep Focused'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
