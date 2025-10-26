import { Link } from 'react-router-dom';
import { Wind } from 'lucide-react';

export default function BreathingExercise() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/30 bg-white/50 backdrop-blur-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3">
        <Wind className="text-gray-800 size-5" />
        <h2 className="text-gray-900 text-lg font-medium leading-tight">
          Breathing Exercise
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-gray-500 text-sm font-normal leading-normal">
          Refuel your brain's oxygen
        </p>

        <div className="relative size-32">
          {/* Outer pulse ring */}
          <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse" />
          {/* Middle pulse ring */}
          <div className="absolute inset-2 rounded-full bg-blue-200 animate-pulse" />
          {/* Inner pulse ring */}
          <div className="absolute inset-4 rounded-full bg-blue-300 animate-pulse" />
          {/* Center circle */}
          <div className="text-sm absolute inset-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 font-medium">
            Breathe
          </div>
        </div>
      </div>

      <Link
        to="/breathing-break"
        className="flex w-full cursor-default items-center justify-center overflow-hidden rounded-xl h-12 px-4 bg-linear-to-r from-blue-400 to-blue-600 text-white font-medium shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <span className="truncate">Start breathing break</span>
      </Link>
    </div>
  );
}
