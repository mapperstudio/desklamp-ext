import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';

export default function NotificationsSettings() {
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [breakReminders, setBreakReminders] = useState(true);
  const [focusComplete, setFocusComplete] = useState(true);
  const [breakComplete, setBreakComplete] = useState(true);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Notifications
        </h2>
        <p className="text-slate-600">
          Configure how and when you receive notifications from DeskLamp.
        </p>
      </div>

      <div className="space-y-8">
        {/* Desktop Notifications */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Desktop Notifications
              </h3>
              <p className="text-slate-600 text-sm">
                Show system notifications for important events
              </p>
            </div>
            <Checkbox
              checked={desktopNotifications}
              onCheckedChange={checked =>
                setDesktopNotifications(checked === true)
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Sound Notifications */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Sound Notifications
              </h3>
              <p className="text-slate-600 text-sm">
                Play audio alerts for timer events
              </p>
            </div>
            <Checkbox
              checked={soundNotifications}
              onCheckedChange={checked =>
                setSoundNotifications(checked === true)
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Break Reminders */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Break Reminders
              </h3>
              <p className="text-slate-600 text-sm">
                Get notified when it's time to take a break
              </p>
            </div>
            <Checkbox
              checked={breakReminders}
              onCheckedChange={checked => setBreakReminders(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Focus Complete */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Focus Session Complete
              </h3>
              <p className="text-slate-600 text-sm">
                Notify when a focus session is finished
              </p>
            </div>
            <Checkbox
              checked={focusComplete}
              onCheckedChange={checked => setFocusComplete(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Break Complete */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Break Complete
              </h3>
              <p className="text-slate-600 text-sm">
                Notify when a break session is finished
              </p>
            </div>
            <Checkbox
              checked={breakComplete}
              onCheckedChange={checked => setBreakComplete(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Test Notification */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Test Notifications
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Test your notification settings to make sure they work properly
            </p>
            <Button
              onClick={() => {
                if (desktopNotifications) {
                  new Notification('DeskLamp Test', {
                    body: 'This is a test notification from DeskLamp!',
                    icon: '/icon48.png',
                  });
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-medium transition-colors"
            >
              Send Test Notification
            </Button>
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
