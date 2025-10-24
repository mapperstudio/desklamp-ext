export interface FocusModeState {
  time: number; // Set time in minutes
  isActive: boolean;
  sessionStartTime: number | null;
  isPaused: boolean;
  originalDuration: number; // Original duration in seconds
}
