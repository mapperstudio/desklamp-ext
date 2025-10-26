import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Play,
  Pause,
  Check,
  PersonStanding,
  RotateCcw,
  Home,
} from 'lucide-react';

interface StretchExercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  instructions: string[];
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  benefits: string[];
}

// Exercise data (same as in StretchBreak.tsx)
const exercises: StretchExercise[] = [
  // Full Body
  {
    id: 'cat-cow-stretch',
    name: 'Cat-Cow Stretch',
    duration: 60,
    description:
      'A gentle spinal warm-up that improves flexibility and reduces tension',
    instructions: [
      'Start on hands and knees in tabletop position',
      'Arch your back and lift your head (cow pose)',
      'Round your spine and tuck your chin (cat pose)',
      'Flow between poses slowly and smoothly',
      'Focus on breathing with each movement',
    ],
    tags: ['full-body', 'spine', 'beginner'],
    difficulty: 'Beginner',
    benefits: ['Spinal flexibility', 'Core strength', 'Stress relief'],
  },
  {
    id: 'child-pose',
    name: "Child's Pose",
    duration: 90,
    description:
      'A restorative pose that stretches the back, hips, and shoulders',
    instructions: [
      'Kneel on the floor with knees hip-width apart',
      'Sit back on your heels',
      'Fold forward and extend arms in front',
      'Rest forehead on the floor',
      'Breathe deeply and relax',
    ],
    tags: ['full-body', 'back', 'hips', 'shoulders'],
    difficulty: 'Beginner',
    benefits: ['Stress relief', 'Back flexibility', 'Hip mobility'],
  },

  // Neck & Shoulder
  {
    id: 'neck-rolls',
    name: 'Neck Rolls',
    duration: 30,
    description:
      'Gentle neck stretches to relieve tension and improve mobility',
    instructions: [
      'Sit or stand with shoulders relaxed',
      'Slowly roll your head in a circular motion',
      'Keep movements gentle and controlled',
      'Reverse direction halfway through',
      'Focus on releasing tension',
    ],
    tags: ['neck-shoulder', 'neck'],
    difficulty: 'Beginner',
    benefits: ['Neck mobility', 'Tension relief', 'Better posture'],
  },
  {
    id: 'shoulder-shrugs',
    name: 'Shoulder Shrugs',
    duration: 45,
    description: 'Release shoulder tension and improve range of motion',
    instructions: [
      'Stand or sit with arms at your sides',
      'Lift shoulders up towards your ears',
      'Hold for 2-3 seconds',
      'Slowly lower and relax',
      'Repeat with smooth movements',
    ],
    tags: ['neck-shoulder', 'shoulders'],
    difficulty: 'Beginner',
    benefits: ['Shoulder mobility', 'Tension relief', 'Posture improvement'],
  },
  {
    id: 'ear-to-shoulder',
    name: 'Ear to Shoulder Stretch',
    duration: 60,
    description: 'Lateral neck stretch to relieve side neck tension',
    instructions: [
      'Sit or stand with shoulders relaxed',
      'Gently tilt head to one side',
      'Bring ear towards shoulder',
      'Hold for 15-20 seconds',
      'Switch sides and repeat',
    ],
    tags: ['neck-shoulder', 'neck'],
    difficulty: 'Beginner',
    benefits: ['Neck flexibility', 'Tension relief', 'Better alignment'],
  },

  // Upper Back & Spine
  {
    id: 'seated-spinal-twist',
    name: 'Seated Spinal Twist',
    duration: 60,
    description: 'Gentle spinal rotation to improve back flexibility',
    instructions: [
      'Sit up straight in your chair',
      'Place one hand on opposite knee',
      'Gently twist your torso',
      'Hold and breathe deeply',
      'Switch sides and repeat',
    ],
    tags: ['upper-back-spine', 'spine', 'back'],
    difficulty: 'Beginner',
    benefits: ['Spinal mobility', 'Back flexibility', 'Core engagement'],
  },
  {
    id: 'thoracic-extension',
    name: 'Thoracic Extension',
    duration: 45,
    description:
      'Counteract forward head posture and improve upper back mobility',
    instructions: [
      'Sit up straight with hands behind head',
      'Gently arch upper back backward',
      'Look up slightly',
      'Hold for 10-15 seconds',
      'Return to neutral position',
    ],
    tags: ['upper-back-spine', 'posture', 'back'],
    difficulty: 'Intermediate',
    benefits: ['Posture improvement', 'Upper back mobility', 'Neck relief'],
  },

  // Wrist & Forearm
  {
    id: 'wrist-flexor-stretch',
    name: 'Wrist Flexor Stretch',
    duration: 30,
    description: 'Stretch the front of your forearms to relieve wrist tension',
    instructions: [
      'Extend one arm straight in front',
      'Bend wrist downward with palm facing out',
      'Use other hand to gently pull fingers back',
      'Hold for 15-20 seconds',
      'Switch arms and repeat',
    ],
    tags: ['wrist-forearm', 'wrist', 'forearm'],
    difficulty: 'Beginner',
    benefits: [
      'Wrist flexibility',
      'Forearm relief',
      'Carpal tunnel prevention',
    ],
  },
  {
    id: 'wrist-extensor-stretch',
    name: 'Wrist Extensor Stretch',
    duration: 30,
    description: 'Stretch the back of your forearms for better wrist mobility',
    instructions: [
      'Extend one arm straight in front',
      'Bend wrist upward with palm facing down',
      'Use other hand to gently push hand down',
      'Hold for 15-20 seconds',
      'Switch arms and repeat',
    ],
    tags: ['wrist-forearm', 'wrist', 'forearm'],
    difficulty: 'Beginner',
    benefits: ['Wrist mobility', 'Forearm flexibility', 'Typing comfort'],
  },

  // Hip & Lower Back
  {
    id: 'seated-hip-flexor',
    name: 'Seated Hip Flexor Stretch',
    duration: 45,
    description: 'Stretch tight hip flexors from prolonged sitting',
    instructions: [
      'Sit on edge of chair',
      'Extend one leg back behind you',
      'Keep other foot flat on floor',
      'Gently lean forward',
      'Hold and breathe deeply',
    ],
    tags: ['hip-lower-back', 'hips', 'lower-back'],
    difficulty: 'Beginner',
    benefits: ['Hip flexibility', 'Lower back relief', 'Posture improvement'],
  },
  {
    id: 'seated-piriformis',
    name: 'Seated Piriformis Stretch',
    duration: 60,
    description: 'Target the deep hip muscle to relieve sciatic pain',
    instructions: [
      'Sit up straight in chair',
      'Cross one ankle over opposite knee',
      'Gently lean forward',
      'Hold for 20-30 seconds',
      'Switch legs and repeat',
    ],
    tags: ['hip-lower-back', 'hips', 'sciatica'],
    difficulty: 'Intermediate',
    benefits: ['Hip mobility', 'Sciatic relief', 'Lower back comfort'],
  },

  // Calf & Legs
  {
    id: 'seated-calf-stretch',
    name: 'Seated Calf Stretch',
    duration: 45,
    description: 'Stretch your calves while seated to improve circulation',
    instructions: [
      'Sit up straight in chair',
      'Extend one leg straight out',
      'Flex your foot towards you',
      'Hold for 20-30 seconds',
      'Switch legs and repeat',
    ],
    tags: ['calf-legs', 'calves', 'legs'],
    difficulty: 'Beginner',
    benefits: ['Calf flexibility', 'Leg circulation', 'Ankle mobility'],
  },
  {
    id: 'seated-hamstring',
    name: 'Seated Hamstring Stretch',
    duration: 60,
    description: 'Stretch tight hamstrings from prolonged sitting',
    instructions: [
      'Sit on edge of chair',
      'Extend one leg straight out',
      'Keep other foot flat on floor',
      'Reach towards extended foot',
      'Hold and breathe deeply',
    ],
    tags: ['calf-legs', 'hamstrings', 'legs'],
    difficulty: 'Beginner',
    benefits: ['Hamstring flexibility', 'Leg mobility', 'Back relief'],
  },
];

export default function ExercisePage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [searchParams] = useSearchParams();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [_currentInstruction, setCurrentInstruction] = useState(0);
  const [isExerciseMode, setIsExerciseMode] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [selectedFeeling, setSelectedFeeling] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [actualSessionDuration, setActualSessionDuration] = useState<number>(0);

  const feelingOptions = [
    { emoji: '😌', label: 'Relaxed', value: 'relaxed' },
    { emoji: '💪', label: 'Strong', value: 'strong' },
    { emoji: '🔥', label: 'Energized', value: 'energized' },
    { emoji: '😣', label: 'Sore', value: 'sore' },
    { emoji: '🤸', label: 'Flexible', value: 'flexible' },
  ];

  const exercise = exercises.find(ex => ex.id === exerciseId);

  // Get duration from URL parameters
  const customDuration = searchParams.get('duration');
  const exerciseDuration = customDuration
    ? parseInt(customDuration)
    : exercise?.duration || 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && exercise) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsExerciseMode(false);
            setIsCompleted(true);
            setCurrentInstruction(0);

            // Calculate actual session duration
            if (sessionStartTime > 0) {
              const actualDuration = Math.floor(
                (Date.now() - sessionStartTime) / 1000
              );
              setActualSessionDuration(actualDuration);
            }

            return exerciseDuration;
          }
          return prev - 1;
        });

        // Update instruction based on time progress
        const instructionDuration =
          exerciseDuration / exercise.instructions.length;
        const newInstruction = Math.floor(
          (exerciseDuration - timeRemaining) / instructionDuration
        );
        setCurrentInstruction(
          Math.min(newInstruction, exercise.instructions.length - 1)
        );
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, exercise, timeRemaining, exerciseDuration]);

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
            setIsExerciseMode(true);
            setIsActive(true);
            setIsPaused(false);
            setTimeRemaining(exerciseDuration);
            setCurrentInstruction(0);
            setSessionStartTime(Date.now()); // Start tracking actual exercise time
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

  if (!exercise) {
    return (
      <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Exercise Not Found
            </h1>
            <Link
              to="/stretch-break"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Stretch Break
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startSession = () => {
    setIsCountdown(true);
    setCountdownNumber(3);
    setIsCompleted(false); // Reset completed state on new session
    // Don't set session start time here - wait until exercise actually begins
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  const completeSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsExerciseMode(false);
    setIsCompleted(true);
    setTimeRemaining(exerciseDuration);
    setCurrentInstruction(0);

    // Calculate actual session duration
    if (sessionStartTime > 0) {
      const actualDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      setActualSessionDuration(actualDuration);
    }
  };

  const repeatSession = () => {
    setIsCompleted(false);
    setIsCountdown(true);
    setCountdownNumber(3);
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
        (window as any).webkitAudioContext)();
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
    } catch (error) {
      console.log('Audio not supported or blocked:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/stretch-break"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span className="font-medium">Back to Stretch Break</span>
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
                <div className="size-14 mx-auto bg-blue-100/50 rounded-full flex items-center justify-center mb-4">
                  <PersonStanding className="size-8 text-blue-500" />
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
              <div className="pt-6 pb-16">
                <h3 className="text-lg font-medium text-gray-800 mb-8 text-center">
                  How did you feel during the stretch?
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
                <p className="text-2xl text-gray-600 font-medium">Get Ready!</p>
              </div>
            </div>
          ) : !isExerciseMode ? (
            /* Initial Screen */
            <div className="space-y-8">
              {/* Exercise Title */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {exercise.name}
                </h2>
                <p className="text-gray-600 text-lg">{exercise.description}</p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Media Placeholder */}
                <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 p-6 shadow-lg">
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Heart className="size-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">Exercise Media</p>
                      <p className="text-sm">Image/Video placeholder</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Instructions */}
                <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Instructions
                  </h3>
                  <ol className="space-y-3">
                    {exercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Start Exercise Button */}
              <div className="text-center">
                <button
                  onClick={startSession}
                  className="px-8 py-4 bg-linear-to-r from-green-500 to-green-600 text-white font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-lg"
                >
                  Start Exercise ({formatDuration(exerciseDuration)})
                </button>
              </div>
            </div>
          ) : (
            /* Exercise Mode */
            <div className="flex flex-col items-center justify-center min-h-[80vh] mt-8">
              {/* Exercise Name */}
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {exercise.name}
              </h2>

              {/* Media */}
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl border border-white/40 p-8 shadow-lg mb-8">
                <div className="aspect-video bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Heart className="size-20 mx-auto mb-4 opacity-60" />
                    <p className="text-xl font-medium text-gray-600">
                      Exercise Media
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Image/Video placeholder
                    </p>
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-8">
                <div className="text-4xl font-semibold text-gray-800 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-gray-600 text-sm">
                  {isActive
                    ? isPaused
                      ? 'Paused'
                      : 'Keep stretching'
                    : 'Ready'}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={pauseSession}
                  className=" flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
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
                  className=" flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
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
