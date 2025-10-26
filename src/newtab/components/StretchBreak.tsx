import { StretchingIcon } from '@/components/svg/Stretching';
import { PersonStanding } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StretchBreak() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/30 bg-white/50 backdrop-blur-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3">
        <PersonStanding className="text-gray-800 text-3xl" />
        <h2 className="text-gray-900 text-lg font-medium leading-tight">
          Stretch Break
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-gray-500 text-sm font-normal leading-normal">
          Your body will thank you
        </p>
        <div>
          <StretchingIcon fill="#99a1af" height="120px" width="120px" />
        </div>
      </div>

      <Link
        to="/stretch-break"
        className="flex w-full cursor-default items-center justify-center overflow-hidden rounded-xl h-12 px-4 bg-linear-to-r from-gray-400 to-gray-600 text-white font-medium shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <span className="truncate">Start stretch break</span>
      </Link>
    </div>
  );
}
