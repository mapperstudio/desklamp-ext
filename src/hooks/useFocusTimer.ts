import { useState, useEffect } from 'react';
import { FocusModeState } from '@/types/focusmode.interface';
import {
  UseFocusTimerReturn,
  FocusModeResponse,
} from '@/types/focusmode.types';

export function useFocusTimer(): UseFocusTimerReturn {
  const [focusModeState, setFocusModeState] = useState<FocusModeState | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0); // Force re-renders for countdown

  // Format time helper function
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate remaining time based on current state
  const calculateRemainingTime = (): number => {
    if (!focusModeState?.isActive || !focusModeState.sessionStartTime) {
      return 0;
    }

    if (focusModeState.isPaused) {
      return focusModeState.originalDuration;
    }

    // Use current time instead of stored currentTime for more accurate calculation
    const now = Date.now();
    const elapsed = Math.floor((now - focusModeState.sessionStartTime) / 1000);
    return Math.max(0, focusModeState.originalDuration - elapsed);
  };

  // Fetch focus mode state from worker
  const fetchFocusModeState = async () => {
    try {
      const response = (await chrome.runtime.sendMessage({
        action: 'getFocusModeState',
      })) as FocusModeResponse;

      if (response?.success) {
        setFocusModeState(response.state);
      }
    } catch {
      // Silently handle errors
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh state function for external use
  const refreshState = () => {
    fetchFocusModeState();
  };

  // Timer control functions
  const startFocusMode = (duration: number) => {
    if (!isActive) {
      chrome.runtime.sendMessage({
        action: 'updateFocusModeState',
        state: {
          time: duration,
          isActive: true,
          sessionStartTime: Date.now(),
          isPaused: false,
          originalDuration: duration,
        },
      });
      refreshState();
    }
  };

  const pauseFocusMode = () => {
    if (focusModeState?.isActive) {
      if (isPaused) {
        // Resuming - update session start time to current time
        chrome.runtime.sendMessage({
          action: 'updateFocusModeState',
          state: {
            time: focusModeState.time,
            isActive: focusModeState.isActive,
            sessionStartTime: Date.now(),
            isPaused: false,
            originalDuration: focusModeState.originalDuration,
          },
        });
      } else {
        // Pausing - calculate current remaining time
        if (focusModeState.sessionStartTime) {
          const elapsed = Math.floor(
            (Date.now() - focusModeState.sessionStartTime) / 1000
          );
          const currentRemainingTime = Math.max(
            0,
            focusModeState.originalDuration - elapsed
          );

          chrome.runtime.sendMessage({
            action: 'updateFocusModeState',
            state: {
              time: focusModeState.time,
              isActive: focusModeState.isActive,
              sessionStartTime: focusModeState.sessionStartTime,
              isPaused: true,
              originalDuration: currentRemainingTime,
            },
          });
        }
      }
      refreshState();
    }
  };

  const stopFocusMode = () => {
    chrome.runtime.sendMessage({
      action: 'updateFocusModeState',
      state: {
        time: focusModeState?.time || 25,
        isActive: false,
        sessionStartTime: null,
        isPaused: false,
        originalDuration: 0,
      },
    });
    refreshState();
  };

  // Initial load
  useEffect(() => {
    fetchFocusModeState();
  }, []);

  // Listen for focus mode state changes from other tabs via storage
  useEffect(() => {
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.focusModeStateChange && changes.focusModeState) {
        console.log(
          'Hook received storage change:',
          changes.focusModeState.newValue
        );
        setFocusModeState(changes.focusModeState.newValue);
      }
    };

    // Add storage change listener
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Update tick every second when focus mode is active to trigger re-renders
  useEffect(() => {
    if (!focusModeState?.isActive || focusModeState.isPaused) return;

    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [focusModeState?.isActive, focusModeState?.isPaused]);

  // Calculate derived values
  const remainingTime = calculateRemainingTime();
  const formattedTime = formatTime(remainingTime);
  const isActive = focusModeState?.isActive || false;
  const isPaused = focusModeState?.isPaused || false;

  // Use tick to ensure re-renders happen
  const _ = tick; // This ensures the component re-renders when tick changes

  return {
    focusModeState,
    remainingTime,
    formattedTime,
    isLoading,
    isActive,
    isPaused,
    refreshState,
    startFocusMode,
    pauseFocusMode,
    stopFocusMode,
  };
}
