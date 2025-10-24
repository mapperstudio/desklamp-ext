import { FocusModeState } from './focusmode.interface';

export interface UseFocusTimerReturn {
  focusModeState: FocusModeState | null;
  remainingTime: number;
  formattedTime: string;
  isLoading: boolean;
  isActive: boolean;
  isPaused: boolean;
  refreshState: () => void;
  startFocusMode: (duration: number) => void;
  pauseFocusMode: () => void;
  stopFocusMode: () => void;
}

export interface FocusModeResponse {
  success: boolean;
  state: FocusModeState | null;
  remainingTime?: number;
  formattedTime?: string;
}
