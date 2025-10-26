import { Button } from '../../components/ui/button';
import { ExternalLink, Github, Heart } from 'lucide-react';

export default function AboutSettings() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          About DeskLamp
        </h2>
        <p className="text-slate-600">
          Learn more about DeskLamp and how to get the most out of your
          productivity.
        </p>
      </div>

      <div className="space-y-8">
        {/* App Info */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/icon48.png"
              alt="DeskLamp"
              className="w-16 h-16 rounded-xl"
            />
            <div>
              <h3 className="text-xl font-bold text-slate-800">DeskLamp</h3>
              <p className="text-slate-600">Focus & Break Extension</p>
              <p className="text-sm text-slate-500">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-slate-700 leading-relaxed">
            DeskLamp is a productivity extension designed to help you maintain
            focus and take meaningful breaks. Built with modern web technologies
            and inspired by the Pomodoro Technique, it provides a beautiful and
            intuitive interface for managing your work sessions.
          </p>
        </div>

        {/* Features */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Key Features
          </h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Customizable focus and break timers
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Website blocking during focus sessions
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Breathing exercises and stretch breaks
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Beautiful, distraction-free interface
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Desktop notifications and sound alerts
            </li>
          </ul>
        </div>

        {/* Links */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Resources
          </h3>
          <div className="space-y-3">
            <Button
              onClick={() =>
                window.open(
                  'https://github.com/yourusername/desklamp-ext',
                  '_blank'
                )
              }
              className="w-full justify-start bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <Github size={20} className="mr-3" />
              View on GitHub
            </Button>
            <Button
              onClick={() =>
                window.open(
                  'https://github.com/yourusername/desklamp-ext/issues',
                  '_blank'
                )
              }
              className="w-full justify-start bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <ExternalLink size={20} className="mr-3" />
              Report Issues
            </Button>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Credits</h3>
          <p className="text-slate-700 mb-4">
            Made with <Heart className="inline w-4 h-4 text-red-500" /> by the
            DeskLamp team.
          </p>
          <p className="text-sm text-slate-600">
            Built with React, TypeScript, Tailwind CSS, and Lucide React icons.
          </p>
        </div>
      </div>
    </div>
  );
}
