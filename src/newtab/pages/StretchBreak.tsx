import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PersonStanding, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const exerciseCategories = {
  All: 'all',
  'Full Body': 'full-body',
  'Neck & Shoulder': 'neck-shoulder',
  'Upper Back & Spine': 'upper-back-spine',
  'Wrist & Forearm': 'wrist-forearm',
  'Hip & Lower Back': 'hip-lower-back',
  'Calf & Legs': 'calf-legs',
};

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

export default function StretchBreak() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getExercisesByCategory = (category: string) => {
    if (category === 'all') {
      return exercises;
    }
    return exercises.filter(exercise => exercise.tags.includes(category));
  };

  const getDurationOptions = () => {
    return [60, 120, 180]; // 1min, 2min, 3min
  };

  const chooseRandomExercise = () => {
    const availableExercises = getExercisesByCategory(selectedCategory);
    const randomExercise =
      availableExercises[Math.floor(Math.random() * availableExercises.length)];
    const randomDuration =
      getDurationOptions()[
        Math.floor(Math.random() * getDurationOptions().length)
      ];

    // Navigate directly to the randomly selected exercise
    navigate(`/exercise/${randomExercise.id}?duration=${randomDuration}`);
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
          Choose an exercise and duration
        </div>
        <div>
          <Button
            onClick={chooseRandomExercise}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-400 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            Help me choose
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Filter Chips */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(exerciseCategories).map(([name, key]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === key
                      ? 'bg-white text-blue-600 border-2 border-blue-500 shadow-md'
                      : 'bg-white/50 text-gray-700 border-2 border-white/40 shadow-sm hover:bg-gray-50 hover:shadow-lg'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getExercisesByCategory(selectedCategory).map(exercise => (
                <div key={exercise.id} className="group block">
                  <div className="backdrop-blur-sm rounded-xl border border-white/40 bg-white/60 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Exercise Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {exercise.name}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {exercise.description}
                        </p>
                      </div>
                    </div>

                    {/* Exercise Details */}
                    <div className="space-y-4">
                      {/* Benefits */}
                      <div className="flex flex-wrap gap-1">
                        {exercise.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>

                      {/* Duration Selection */}
                      <div className="space-y-2">
                        <div>Duration</div>
                        <div className="flex gap-2 flex-wrap">
                          {getDurationOptions().map(duration => (
                            <Link
                              key={duration}
                              to={`/exercise/${exercise.id}?duration=${duration}`}
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

            {/* Empty State */}
            {getExercisesByCategory(selectedCategory).length === 0 && (
              <div className="text-center py-12">
                <PersonStanding className="size-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No exercises found
                </h3>
                <p className="text-gray-600">
                  Try selecting a different category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
