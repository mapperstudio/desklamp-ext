import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';

export default function FocusSettings() {
  const [defaultFocusTime, setDefaultFocusTime] = useState(25);
  const [autoBreak, setAutoBreak] = useState(true);
  const [breakReminder, setBreakReminder] = useState(true);
  const [strictMode, setStrictMode] = useState(false);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Focus Settings
        </h2>
        <p className="text-slate-600">
          Customize your focus sessions and productivity preferences.
        </p>
      </div>

      <div className="space-y-8">
        {/* Default Focus Time */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Default Focus Duration
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="60"
                value={defaultFocusTime}
                onChange={e => setDefaultFocusTime(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none  slider"
              />
              <span className="text-lg font-semibold text-slate-800 min-w-12">
                {defaultFocusTime} min
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-2">
              Set your preferred focus session length
            </p>
          </div>
        </div>

        {/* Auto Break */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Auto Start Break
              </h3>
              <p className="text-slate-600 text-sm">
                Automatically start break timer after focus session
              </p>
            </div>
            <Checkbox
              checked={autoBreak}
              onCheckedChange={checked => setAutoBreak(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Break Reminder */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Break Reminders
              </h3>
              <p className="text-slate-600 text-sm">
                Show notifications when it's time to take a break
              </p>
            </div>
            <Checkbox
              checked={breakReminder}
              onCheckedChange={checked => setBreakReminder(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Strict Mode */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Strict Focus Mode
              </h3>
              <p className="text-slate-600 text-sm">
                Block all distracting websites during focus sessions
              </p>
            </div>
            <Checkbox
              checked={strictMode}
              onCheckedChange={checked => setStrictMode(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-xl font-medium transition-colors">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
