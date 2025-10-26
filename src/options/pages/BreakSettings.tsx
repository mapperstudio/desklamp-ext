import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';

export default function BreakSettings() {
  const [defaultBreakTime, setDefaultBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [autoStartFocus, setAutoStartFocus] = useState(false);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Break Settings
        </h2>
        <p className="text-slate-600">
          Configure your break preferences and relaxation routines.
        </p>
      </div>

      <div className="space-y-8">
        {/* Default Break Time */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Short Break Duration
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="30"
                value={defaultBreakTime}
                onChange={e => setDefaultBreakTime(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none  slider"
              />
              <span className="text-lg font-semibold text-slate-800 min-w-12">
                {defaultBreakTime} min
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-2">
              Duration for regular breaks between focus sessions
            </p>
          </div>
        </div>

        {/* Long Break Time */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Long Break Duration
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="60"
                value={longBreakTime}
                onChange={e => setLongBreakTime(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none  slider"
              />
              <span className="text-lg font-semibold text-slate-800 min-w-12">
                {longBreakTime} min
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-2">
              Duration for extended breaks after multiple focus sessions
            </p>
          </div>
        </div>

        {/* Long Break Interval */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Long Break Interval
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="8"
                value={longBreakInterval}
                onChange={e => setLongBreakInterval(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none  slider"
              />
              <span className="text-lg font-semibold text-slate-800 min-w-12">
                {longBreakInterval} sessions
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-2">
              Number of focus sessions before taking a long break
            </p>
          </div>
        </div>

        {/* Auto Start Focus */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Auto Start Focus
              </h3>
              <p className="text-slate-600 text-sm">
                Automatically start focus mode after break ends
              </p>
            </div>
            <Checkbox
              checked={autoStartFocus}
              onCheckedChange={checked => setAutoStartFocus(checked === true)}
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
