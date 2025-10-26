import { useFocusTimer } from '@/hooks/useFocusTimer';

interface FocusTimerDisplayProps {
  showTimer?: boolean;
  className?: string;
}

export function FocusTimerDisplay({
  showTimer = true,
  className = '',
}: FocusTimerDisplayProps) {
  const { formattedTime, isActive, isPaused, isLoading } = useFocusTimer();

  if (isLoading) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>Loading...</div>
    );
  }

  if (!isActive) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Focus mode inactive
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className={`text-sm text-orange-600 ${className}`}>
        Focus mode paused
      </div>
    );
  }

  return (
    <div className={`text-sm text-green-600 ${className}`}>
      {showTimer ? `Focus: ${formattedTime}` : 'Focus mode active'}
    </div>
  );
}
