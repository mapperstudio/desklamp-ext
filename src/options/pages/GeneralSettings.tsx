import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';

export default function GeneralSettings() {
  const [autoStart, setAutoStart] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [hasNewTabPermission, setHasNewTabPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isExtensionPinned, setIsExtensionPinned] = useState(false);
  const [isPinningExtension, setIsPinningExtension] = useState(false);

  // Check if new tab override permission is granted
  useEffect(() => {
    if (chrome?.runtime) {
      chrome.runtime.sendMessage(
        { type: 'CHECK_NEW_TAB_PERMISSION' },
        response => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error checking new tab permission:',
              chrome.runtime.lastError
            );
            return;
          }
          setHasNewTabPermission(response);
        }
      );
    }
  }, []);

  // Check if extension is pinned
  useEffect(() => {
    if (chrome?.runtime) {
      chrome.runtime.sendMessage(
        { type: 'CHECK_EXTENSION_PINNED' },
        response => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error checking extension pinned state:',
              chrome.runtime.lastError
            );
            return;
          }
          setIsExtensionPinned(response);
        }
      );
    }
  }, []);

  const requestNewTabPermission = async () => {
    if (!chrome?.runtime) {
      console.error('Chrome runtime API not available');
      return;
    }

    setIsRequestingPermission(true);

    try {
      // Send message to background script to enable new tab override
      chrome.runtime.sendMessage(
        { type: 'SET_NEW_TAB_PERMISSION', enabled: true },
        response => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error setting new tab permission:',
              chrome.runtime.lastError
            );
            setIsRequestingPermission(false);
            return;
          }

          if (response?.success) {
            setHasNewTabPermission(true);
            console.log('New tab override permission granted');
          } else {
            console.log('Failed to grant new tab override permission');
          }
          setIsRequestingPermission(false);
        }
      );
    } catch (error) {
      console.error('Error requesting new tab permission:', error);
      setIsRequestingPermission(false);
    }
  };

  const revokeNewTabPermission = async () => {
    if (!chrome?.runtime) {
      console.error('Chrome runtime API not available');
      return;
    }

    try {
      // Send message to background script to disable new tab override
      chrome.runtime.sendMessage(
        { type: 'SET_NEW_TAB_PERMISSION', enabled: false },
        response => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error revoking new tab permission:',
              chrome.runtime.lastError
            );
            return;
          }

          if (response?.success) {
            setHasNewTabPermission(false);
            console.log('New tab override permission revoked');
          }
        }
      );
    } catch (error) {
      console.error('Error revoking new tab permission:', error);
    }
  };

  const pinExtension = async () => {
    if (!chrome?.runtime) {
      console.error('Chrome runtime API not available');
      return;
    }

    setIsPinningExtension(true);

    try {
      chrome.runtime.sendMessage({ type: 'PIN_EXTENSION' }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error pinning extension:', chrome.runtime.lastError);
          setIsPinningExtension(false);
          return;
        }

        if (response?.success) {
          setIsExtensionPinned(true);
          console.log('Extension pinned successfully');
        } else {
          console.log('Failed to pin extension');
        }
        setIsPinningExtension(false);
      });
    } catch (error) {
      console.error('Error pinning extension:', error);
      setIsPinningExtension(false);
    }
  };

  const unpinExtension = async () => {
    if (!chrome?.runtime) {
      console.error('Chrome runtime API not available');
      return;
    }

    try {
      chrome.runtime.sendMessage({ type: 'UNPIN_EXTENSION' }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error unpinning extension:', chrome.runtime.lastError);
          return;
        }

        if (response?.success) {
          setIsExtensionPinned(false);
          console.log('Extension unpinned successfully');
        }
      });
    } catch (error) {
      console.error('Error unpinning extension:', error);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          General Settings
        </h2>
        <p className="text-slate-600">
          Configure your general preferences and application behavior.
        </p>
      </div>

      <div className="space-y-8">
        {/* Auto Start */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Auto Start Focus Mode
              </h3>
              <p className="text-slate-600 text-sm">
                Automatically start focus mode when you open the extension
              </p>
            </div>
            <Checkbox
              checked={autoStart}
              onCheckedChange={checked => setAutoStart(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Dark Mode */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Dark Mode
              </h3>
              <p className="text-slate-600 text-sm">
                Switch to dark theme for better visibility in low light
              </p>
            </div>
            <Checkbox
              checked={darkMode}
              onCheckedChange={checked => setDarkMode(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Sound Effects */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Sound Effects
              </h3>
              <p className="text-slate-600 text-sm">
                Enable audio notifications and timer sounds
              </p>
            </div>
            <Checkbox
              checked={soundEnabled}
              onCheckedChange={checked => setSoundEnabled(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Language */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Language
            </h3>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        {/* Extension Pinning */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Extension Pinning
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Pin DeskLamp to your browser toolbar for quick access to focus
                tools and productivity features
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isExtensionPinned
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isExtensionPinned ? '📌 Pinned' : '📌 Not Pinned'}
                </div>
              </div>
            </div>
            <div className="ml-4">
              {isExtensionPinned ? (
                <Button
                  onClick={unpinExtension}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Unpin Extension
                </Button>
              ) : (
                <Button
                  onClick={pinExtension}
                  disabled={isPinningExtension}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPinningExtension ? 'Pinning...' : 'Pin Extension'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* New Tab Override */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                New Tab Override
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Allow DeskLamp to customize your new tab page with focus tools
                and productivity features
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hasNewTabPermission
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {hasNewTabPermission
                    ? '✓ Permission Granted'
                    : '⚠ Permission Required'}
                </div>
              </div>
            </div>
            <div className="ml-4">
              {hasNewTabPermission ? (
                <Button
                  onClick={revokeNewTabPermission}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Revoke Permission
                </Button>
              ) : (
                <Button
                  onClick={requestNewTabPermission}
                  disabled={isRequestingPermission}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequestingPermission
                    ? 'Requesting...'
                    : 'Grant Permission'}
                </Button>
              )}
            </div>
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
