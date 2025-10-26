import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Check,
  RotateCcw,
  Home,
  Wind,
} from 'lucide-react';

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  technique: string;
  benefits: string[];
  phases: {
    inhale: number;
    hold?: number;
    exhale: number;
    hold2?: number;
  };
  tags: string[];
  durations: number[];
}

const breathingExercises: BreathingExercise[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'Regulate. Focus.',
    technique: '4s inhale - 4s hold - 4s exhale - 4s hold',
    benefits: [
      'Stress reduction',
      'Improved focus',
      'Better sleep',
      'Anxiety relief',
    ],
    phases: { inhale: 4, hold: 4, exhale: 4, hold2: 4 },
    tags: ['focus', 'calming'],
    durations: [120, 180, 240], // 2min, 3min, 4min
  },
  {
    id: '4-7-8-breathing',
    name: '4-7-8 Breathing',
    description: 'Feel less anxious.',
    technique: '4s inhale - 7s hold - 8s exhale',
    benefits: [
      'Anxiety relief',
      'Better sleep',
      'Stress reduction',
      'Mental clarity',
    ],
    phases: { inhale: 4, hold: 7, exhale: 8 },
    tags: ['anxiety', 'relaxation'],
    durations: [120, 180, 300], // 2min, 3min, 5min
  },
  {
    id: '7-11-breathing',
    name: '7-11 Breathing',
    description: 'Deep relaxation.',
    technique: '7s inhale - 11s exhale',
    benefits: [
      'Deep relaxation',
      'Heart rate regulation',
      'Stress relief',
      'Better focus',
    ],
    phases: { inhale: 7, exhale: 11 },
    tags: ['relaxation', 'deep-breathing'],
    durations: [120, 180, 300], // 2min, 3min, 5min
  },
  {
    id: 'triangle-breathing',
    name: 'Triangle Breathing',
    description: 'Quick stress relief.',
    technique: '4s inhale - 4s hold - 4s exhale',
    benefits: [
      'Quick stress relief',
      'Mental clarity',
      'Energy boost',
      'Focus improvement',
    ],
    phases: { inhale: 4, hold: 4, exhale: 4 },
    tags: ['quick-relief', 'energy'],
    durations: [120, 180, 240], // 2min, 3min, 4min
  },
];

export default function BreathingExercisePage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [searchParams] = useSearchParams();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold2'>(
    'inhale'
  );
  const [phaseTime, setPhaseTime] = useState(0);
  const [isExerciseMode, setIsExerciseMode] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [actualSessionDuration, setActualSessionDuration] = useState(0);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [lastPlayedPhase, setLastPlayedPhase] = useState<string | null>(null);

  const exercise = breathingExercises.find(ex => ex.id === exerciseId);

  // Feeling options
  const feelingOptions = [
    { emoji: '😌', label: 'Calm', value: 'calm' },
    { emoji: '😊', label: 'Happy', value: 'happy' },
    { emoji: '🧘‍♀️', label: 'Mindful', value: 'mindful' },
    { emoji: '😴', label: 'Sleepy', value: 'sleepy' },
    { emoji: '💪', label: 'Energized', value: 'energized' },
  ];

  // Audio cues for breathing phases
  const playBreathingCue = (phaseName: string) => {
    if (lastPlayedPhase !== phaseName) {
      let audioFile = '';
      switch (phaseName) {
        case 'inhale':
          audioFile = chrome.runtime.getURL('src/assets/shimmer_inhale.mp3');
          break;
        case 'exhale':
          audioFile = chrome.runtime.getURL('src/assets/shimmer_exhale.mp3');
          break;
        case 'hold':
          audioFile = chrome.runtime.getURL('src/assets/shimmer_hold.mp3');
          break;
        default:
          audioFile = chrome.runtime.getURL('src/assets/shimmer_inhale.mp3');
      }

      const audio = new Audio(audioFile);
      audio.volume = 0.7;
      audio.play().catch(() => {
        // Audio playback failed - silently continue
      });
      setLastPlayedPhase(phaseName);
    }
  };

  // Get duration from URL parameters
  const customDuration = searchParams.get('duration');
  const exerciseDuration = customDuration
    ? parseInt(customDuration)
    : exercise?.phases
      ? 120
      : 120;

  // Define phase colors and text
  const phaseConfig = {
    inhale: {
      color: 'bg-blue-500',
      text: 'Inhale',
      duration: exercise?.phases.inhale || 4,
    },
    hold: {
      color: 'bg-blue-600',
      text: 'Hold',
      duration: exercise?.phases.hold || 0,
    },
    exhale: {
      color: 'bg-blue-400',
      text: 'Exhale',
      duration: exercise?.phases.exhale || 4,
    },
    hold2: {
      color: 'bg-blue-700',
      text: 'Hold',
      duration: exercise?.phases.hold2 || 0,
    },
  };

  // Main timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && exercise) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (sessionStartTime) {
              const actualDuration = Math.round(
                (Date.now() - sessionStartTime) / 1000
              );
              setActualSessionDuration(actualDuration);
            }
            setIsActive(false);
            setIsExerciseMode(false);
            setIsCompleted(true);
            setPhase('inhale');
            setPhaseTime(0);
            return exerciseDuration;
          }
          return prev - 1;
        });

        setPhaseTime(prev => {
          const currentPhaseDuration = phaseConfig[phase].duration;
          if (currentPhaseDuration === 0) {
            // Skip phases with 0 duration
            if (phase === 'inhale') {
              setPhase('exhale');
              playBreathingCue('exhale');
            } else if (phase === 'exhale') {
              setPhase('inhale');
              playBreathingCue('inhale');
            }
            return 0;
          }

          if (prev >= currentPhaseDuration - 1) {
            // Move to next phase
            if (phase === 'inhale') {
              const nextPhase = exercise.phases.hold ? 'hold' : 'exhale';
              setPhase(nextPhase);
              if (nextPhase === 'hold') {
                playBreathingCue('hold');
              } else {
                playBreathingCue('exhale');
              }
            } else if (phase === 'hold') {
              setPhase('exhale');
              playBreathingCue('exhale');
            } else if (phase === 'exhale') {
              const nextPhase = exercise.phases.hold2 ? 'hold2' : 'inhale';
              setPhase(nextPhase);
              if (nextPhase === 'hold2') {
                playBreathingCue('hold');
              } else {
                playBreathingCue('inhale');
              }
            } else if (phase === 'hold2') {
              setPhase('inhale');
              playBreathingCue('inhale');
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, exercise, timeRemaining, exerciseDuration, phase]);

  // Countdown timer effect
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (isCountdown && countdownNumber > 0) {
      countdownInterval = setInterval(() => {
        setCountdownNumber(prev => {
          if (prev <= 1) {
            // Final countdown - play different sound and haptic
            playTickSound();
            triggerHaptic([100, 50, 100]); // Longer vibration pattern
            setIsCountdown(false);
            setIsTransitioning(true);

            // Start the transition animation and delay before exercise begins
            setTimeout(() => {
              setIsTransitioning(false);
              setIsExerciseMode(true);
              setIsActive(true);
              setIsPaused(false);
              setTimeRemaining(exerciseDuration);
              setPhase('inhale');
              setPhaseTime(0);
              setSessionStartTime(Date.now());
              playBreathingCue('inhale');
            }, 3000); // 3 second delay for smooth transition

            return 3; // Reset for next time
          }
          // Play sound and haptic for each countdown number
          playTickSound();
          triggerHaptic(50);
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdownInterval);
  }, [isCountdown, countdownNumber, exerciseDuration]);

  // Play initial sound and haptic when countdown starts
  useEffect(() => {
    if (isCountdown && countdownNumber === 3) {
      playTickSound();
      triggerHaptic(50);
    }
  }, [isCountdown]);

  // Handle transition animation
  useEffect(() => {
    if (isTransitioning) {
      setTransitionProgress(0);
      const interval = setInterval(() => {
        setTransitionProgress(prev => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.02; // Smooth animation over 3 seconds
        });
      }, 60); // ~60fps

      return () => clearInterval(interval);
    }
  }, [isTransitioning]);

  if (!exercise) {
    return (
      <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Exercise Not Found
            </h1>
            <Link
              to="/breathing-break"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Breathing Break
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startSession = () => {
    setIsCountdown(true);
    setCountdownNumber(3);
    setIsCompleted(false);
    setLastPlayedPhase(null); // Reset audio tracking for new session
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  const completeSession = () => {
    if (sessionStartTime) {
      const actualDuration = Math.round((Date.now() - sessionStartTime) / 1000);
      setActualSessionDuration(actualDuration);
    }
    setIsActive(false);
    setIsPaused(false);
    setIsExerciseMode(false);
    setIsCompleted(true);
    setTimeRemaining(exerciseDuration);
    setPhase('inhale');
    setPhaseTime(0);
  };

  const repeatSession = () => {
    setIsCompleted(false);
    setIsTransitioning(false);
    setTransitionProgress(0);
    setIsCountdown(true);
    setCountdownNumber(3);
    setActualSessionDuration(0);
    setSessionStartTime(null);
    setSelectedFeeling(null);
    setLastPlayedPhase(null); // Reset audio tracking for repeat session
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} min`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProgressPercentage = () => {
    const currentPhaseDuration = phaseConfig[phase].duration;
    if (currentPhaseDuration === 0) return 0;
    return ((phaseTime + 1) / currentPhaseDuration) * 100;
  };

  // Get scale value based on current phase
  const getCircleScale = () => {
    if (!isActive) return 0.3;

    const progress = getProgressPercentage() / 100;

    if (phase === 'inhale') {
      // Scale from 0.3 to 1.0 during inhale (completely fill outer ring)
      return 0.3 + progress * 0.7;
    } else if (phase === 'hold') {
      // After inhale, stay at full size (1.0)
      return 1.0;
    } else if (phase === 'exhale') {
      // Scale from 1.0 to 0.3 during exhale
      return 1.0 - progress * 0.7;
    } else if (phase === 'hold2') {
      // After exhale, stay at small size (0.3)
      return 0.3;
    }
    return 0.3;
  };

  // Haptic feedback function
  const triggerHaptic = (pattern: number | number[] = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Sound generation function
  const playTickSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch {
      // Audio not supported or blocked - silently continue
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 backdrop-blur-lg">
        <Link
          to="/breathing-break"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span className="font-medium">Back to Breathing Break</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {isCompleted ? (
            /* Congratulations Screen */
            <div className="max-w-4xl mx-auto">
              {/* Top Section - Achievement */}
              <div className="text-center mb-12">
                <div className="size-14 mx-auto bg-yellow-100/50 rounded-full flex items-center justify-center mb-4">
                  <Wind className="size-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  You did it!
                </h2>
                <p className="text-gray-600 text-xl mb-2">
                  {exercise.name} exercise
                </p>
                <p className="text-gray-500 text-lg">
                  Duration:{' '}
                  {actualSessionDuration > 0
                    ? formatDuration(actualSessionDuration)
                    : formatDuration(exerciseDuration)}
                </p>
              </div>

              {/* Middle Section - Feelings */}
              <div className="p-8 mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-8 text-center">
                  How are you feeling now?
                </h3>
                <div className="flex justify-center gap-8">
                  {feelingOptions.map(feeling => (
                    <button
                      key={feeling.value}
                      onClick={() => setSelectedFeeling(feeling.value)}
                      className={`flex flex-col items-center gap-3 hover:shadow-lg transition-all duration-200 p-3 rounded-xl ${
                        selectedFeeling === feeling.value
                          ? 'bg-blue-100 border-2 border-blue-400'
                          : 'hover:bg-white/20'
                      }`}
                    >
                      <span className="text-4xl">{feeling.emoji}</span>
                      <span className="text-xs font-medium text-gray-700">
                        {feeling.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Section - Actions */}
              <div className="text-center">
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={repeatSession}
                    className=" flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
                  >
                    <RotateCcw className="size-4" />
                    Repeat Session
                  </button>

                  <Link
                    to="/dashboard"
                    className=" flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
                  >
                    <Home className="size-4" />
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          ) : isCountdown ? (
            /* Countdown Screen */
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="text-9xl font-bold text-gray-900 mb-4 animate-pulse">
                  {countdownNumber}
                </div>
                <p className="text-3xl text-gray-500 font-medium">Get Ready!</p>
              </div>
            </div>
          ) : isTransitioning ? (
            /* Transition Screen */
            <div className="flex flex-col items-center justify-center min-h-[80vh] mt-8">
              {/* Breathing Circle with Screen-Filling Scale-Down Animation */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative size-56 mb-6">
                  {/* Outer Ring - Largest - Starts screen-filling and scales down */}
                  <div
                    className="absolute inset-0 rounded-full bg-blue-200/20 transition-all duration-100 ease-out"
                    style={{
                      transform: `scale(${8 - transitionProgress * 7})`,
                      opacity: 0.1 + transitionProgress * 0.5,
                    }}
                  />

                  {/* Middle Ring */}
                  <div
                    className="absolute inset-2 rounded-full bg-blue-200/25 transition-all duration-100 ease-out"
                    style={{
                      transform: `scale(${6 - transitionProgress * 5})`,
                      opacity: 0.15 + transitionProgress * 0.5,
                    }}
                  />

                  {/* Inner Ring */}
                  <div
                    className="absolute inset-4 rounded-full bg-blue-200/30 transition-all duration-100 ease-out"
                    style={{
                      transform: `scale(${4 - transitionProgress * 3})`,
                      opacity: 0.2 + transitionProgress * 0.5,
                    }}
                  />

                  {/* Core Circle */}
                  <div
                    className="absolute inset-6 rounded-full bg-blue-200/35 transition-all duration-100 ease-out"
                    style={{
                      transform: `scale(${2.5 - transitionProgress * 1.5})`,
                      opacity: 0.25 + transitionProgress * 0.5,
                    }}
                  />

                  {/* Text Content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-black/20 text-sm mb-2 drop-shadow-lg">
                        Sit tight...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !isExerciseMode ? (
            /* Initial Screen */
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {exercise.name}
              </h1>
              <h2 className="text-gray-800 text-xl font-medium">
                Instructions
              </h2>

              {/* Breathing Steps */}
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex items-center gap-4 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40">
                  <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    1
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-800">
                      Inhale
                    </span>
                    <span className="text-sm text-gray-600">
                      Breathe in slowly and deeply for{' '}
                      {phaseConfig.inhale.duration} seconds
                    </span>
                  </div>
                </div>

                {phaseConfig.hold.duration > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40">
                    <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      2
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-gray-800">
                        Hold
                      </span>
                      <span className="text-sm text-gray-600">
                        Hold your breath for {phaseConfig.hold.duration} seconds
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40">
                  <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {phaseConfig.hold.duration > 0 ? '3' : '2'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-800">
                      Exhale
                    </span>
                    <span className="text-sm text-gray-600">
                      Breathe out slowly and completely for{' '}
                      {phaseConfig.exhale.duration} seconds
                    </span>
                  </div>
                </div>

                {phaseConfig.hold2.duration > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40">
                    <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      4
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-gray-800">
                        Hold
                      </span>
                      <span className="text-sm text-gray-600">
                        Hold your breath for {phaseConfig.hold2.duration}{' '}
                        seconds
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Start Exercise Button */}
              <button
                onClick={startSession}
                className=" flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
              >
                <Play className="size-5" />
                <span>Start {formatDuration(exerciseDuration)} Session</span>
              </button>
            </div>
          ) : (
            /* Exercise Mode */
            <div className="flex flex-col items-center justify-center min-h-[80vh] mt-8">
              {/* Timer */}
              <div className="text-center mb-16">
                <div className="text-gray-600 text-lg mb-2">
                  {exercise.name}
                </div>
                <div className="text-4xl font-semibold text-gray-800 mb-2">
                  {formatTime(timeRemaining)}
                </div>
              </div>

              {/* Breathing Circle with Scaling Inner Circle */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative size-56 mb-6">
                  {/* Outer Ring - Static */}
                  <div className="absolute inset-0 rounded-full bg-blue-300/50" />

                  {/* Inner Circle - Scales based on phase */}
                  <div
                    className="absolute inset-2 rounded-full bg-blue-500 transition-transform duration-1000 ease-in-out"
                    style={{
                      transform: `scale(${getCircleScale()})`,
                    }}
                  />
                </div>
              </div>

              <div className="mb-12">
                <div className="text-center">
                  <div className="text-base text-blue-500 font-medium drop-shadow-lg">
                    {phaseConfig[phase].text}
                  </div>
                  {/* <div className="text-2xl drop-shadow-md">{phaseTime + 1}</div> */}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4 w-full max-w-sm">
                <button
                  onClick={pauseSession}
                  className=" flex-1 flex items-center justify-center gap-2 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
                >
                  {isPaused ? (
                    <Play className="size-4" />
                  ) : (
                    <Pause className="size-4" />
                  )}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={completeSession}
                  className=" flex-1 flex items-center justify-center gap-2 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
                >
                  <Check className="size-4" />
                  <span>Complete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
