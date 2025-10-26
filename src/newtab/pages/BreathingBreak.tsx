import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function BreathingBreak() {
  const navigate = useNavigate();

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

  const chooseRandomExercise = () => {
    const randomExercise =
      breathingExercises[Math.floor(Math.random() * breathingExercises.length)];
    const randomDuration =
      randomExercise.durations[
        Math.floor(Math.random() * randomExercise.durations.length)
      ];

    // Navigate directly to the randomly selected exercise
    navigate(
      `/breathing-exercise/${randomExercise.id}?duration=${randomDuration}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-6">
        <Link
          to="/dashboard"
          className="flex cursor-default items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
        >
          <ArrowLeft className="size-5" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        <div className="text-xl font-medium text-gray-800">
          Choose a breathing technique and duration
        </div>
        <div>
          <Button
            onClick={chooseRandomExercise}
            className=" flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-400 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            Help me choose
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Exercise Grid */}
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {breathingExercises.map(exercise => (
                <div key={exercise.id} className="group block">
                  <div className="backdrop-blur-sm rounded-xl border border-white/40 bg-white/60 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Exercise Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {exercise.name}
                        </h3>
                        <p className="text-gray-500 text-xs font-medium mb-2">
                          {exercise.technique}
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {exercise.description}
                        </p>
                      </div>
                    </div>

                    {/* Exercise Details */}
                    <div className="space-y-4">
                      {/* Duration Selection */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Duration
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {exercise.durations.map(duration => (
                            <Link
                              key={duration}
                              to={`/breathing-exercise/${exercise.id}?duration=${duration}`}
                              className={`px-4 py-2 cursor-default rounded-xl text-sm font-medium transition-all duration-200 border border-gray-200 ${'bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-lg'}`}
                            >
                              {formatDuration(duration)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
