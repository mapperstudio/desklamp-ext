import { useState, useEffect } from 'react';
import { Lock, Unlock, X, ArrowRight, ChevronDown } from 'lucide-react';

interface BlockedSiteInfo {
  url: string;
  name: string;
  favicon?: string;
}

export default function BlockScreen() {
  const [blockedSite, setBlockedSite] = useState<BlockedSiteInfo | null>(null);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [grantedDuration, setGrantedDuration] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showCustomDropdown, setShowCustomDropdown] = useState(false);

  useEffect(() => {
    // Get blocked site info from URL parameters or storage
    const urlParams = new URLSearchParams(window.location.search);
    const blockedUrl = urlParams.get('url') || 'blocked-site.com';
    const siteName = urlParams.get('name') || extractSiteName(blockedUrl);

    setBlockedSite({
      url: blockedUrl,
      name: siteName,
      favicon: `https://www.google.com/s2/favicons?domain=${blockedUrl}&sz=32`,
    });
  }, []);

  const extractSiteName = (url: string) => {
    const domain = url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
    return (
      domain.split('.')[0].charAt(0).toUpperCase() +
      domain.split('.')[0].slice(1)
    );
  };

  const showTimeSelectorHandler = () => {
    if (!blockedSite) return;
    setShowTimeSelector(true);
  };

  const grantAccessHandler = (duration: number) => {
    if (!blockedSite) return;

    console.log('Granting access for duration:', duration, 'minutes');

    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.error('Extension context is invalid');
      alert('Extension context is invalid. Please refresh the page.');
      return;
    }

    // Start the unlocking sequence
    setIsGrantingAccess(true);
    setGrantedDuration(duration);
    setIsUnlocked(false);

    // Timing constants for consistent UI delays
    const SPINNER_DURATION_MS = 2000; // 2 seconds
    const COUNTDOWN_DURATION_SECONDS = 2; // 2 seconds
    const UI_DELAY_SECONDS =
      SPINNER_DURATION_MS / 1000 + COUNTDOWN_DURATION_SECONDS; // 5 seconds total

    // Calculate fair duration: add UI delay time to compensate for spinner + countdown
    const fairDurationMs = (duration * 60 + UI_DELAY_SECONDS) * 1000;

    chrome.runtime.sendMessage(
      {
        action: 'temporaryUnblock',
        url: blockedSite.url,
        duration: fairDurationMs, // Fair duration that compensates for UI delays
      },
      response => {
        if (response?.success) {
          // Show spinner for a bit, then show unlocked state
          setTimeout(() => {
            setIsUnlocked(true);
            // Start countdown
            setCountdown(COUNTDOWN_DURATION_SECONDS);
            const countdownInterval = setInterval(() => {
              setCountdown(prev => {
                if (prev === null || prev <= 1) {
                  clearInterval(countdownInterval);
                  window.location.href = blockedSite.url;
                  return null;
                }
                return prev - 1;
              });
            }, 1000);
          }, SPINNER_DURATION_MS); // Show spinner for consistent duration
        } else {
          console.error('Failed to create temporary unblock:', response);
          setIsGrantingAccess(false);
          setGrantedDuration(null);
          setIsUnlocked(false);
          setCountdown(null);
        }
      }
    );
  };

  const closeTab = () => {
    chrome.tabs.getCurrent(tab => {
      if (tab?.id) {
        chrome.tabs.remove(tab.id);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Blocked Site Info */}
          <div className="mb-8">
            <div className="size-16 mx-auto bg-white/80 rounded-full flex items-center justify-center mb-4 shadow-lg">
              {blockedSite?.favicon ? (
                <img
                  src={blockedSite.favicon}
                  alt={`${blockedSite.name} favicon`}
                  className="size-8 rounded-sm"
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Lock className="size-8 text-red-500" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Site blocked
            </h1>
            <p className="text-gray-500">{blockedSite?.url}</p>
          </div>

          {/* Message */}
          <p className="text-gray-600 my-10 text-lg">
            {blockedSite?.name} has been blocked to help you maintain focus and
            productivity.
          </p>

          {/* Time Duration Selector */}
          {showTimeSelector && !isGrantingAccess && (
            <div className="mb-8 bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Allow access for:
                </h3>
                <button
                  onClick={() => setShowTimeSelector(false)}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 hover:shadow-lg transition-all duration-300 p-1 rounded-lg"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="space-y-3">
                {/* Quick Duration Buttons */}
                <div className="flex gap-2">
                  {[1, 5, 10, 15].map(duration => (
                    <button
                      key={duration}
                      onClick={() => grantAccessHandler(duration)}
                      className="cursor-pointer flex-1 px-3 py-2 rounded-lg font-medium transition-all bg-white text-gray-700 hover:bg-gray-100 hover:text-black hover:shadow-lg border border-gray-200 whitespace-nowrap text-sm shadow-sm"
                    >
                      {duration} minute{duration !== 1 ? 's' : ''}
                    </button>
                  ))}
                </div>

                {/* Custom Duration Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCustomDropdown(!showCustomDropdown)}
                    className="w-full cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all bg-white text-gray-700 hover:bg-gray-100 hover:text-black hover:shadow-lg border border-gray-200 text-sm shadow-sm"
                  >
                    <span>Custom time</span>
                    <ChevronDown
                      className={`size-4 transition-transform duration-200 ${showCustomDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Options */}
                  {showCustomDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {[30, 45, 60, 90, 120].map(duration => (
                        <button
                          key={duration}
                          onClick={() => {
                            grantAccessHandler(duration);
                            setShowCustomDropdown(false);
                          }}
                          className="w-full cursor-pointer px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {duration < 60
                            ? `${duration} minutes`
                            : `${Math.floor(duration / 60)} hour${Math.floor(duration / 60) !== 1 ? 's' : ''}${duration % 60 ? ` ${duration % 60} minutes` : ''}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Elegant Access Granting Animation */}
          {isGrantingAccess && (
            <div className="mb-8 bg-white rounded-2xl p-8 shadow-lg text-center">
              {/* Icon Circle */}
              <div className="relative mx-auto mb-6 w-16 h-16">
                {!isUnlocked ? (
                  <>
                    {/* Spinning Circle */}
                    <div className="absolute inset-0 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="size-6 text-gray-600" />
                    </div>
                  </>
                ) : (
                  /* Unlocked Icon with Border Circle */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <Unlock className="size-6 text-gray-800" />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Text */}
              <div className="space-y-3">
                {!isUnlocked ? (
                  <>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Unlocking...
                    </h3>
                    <p className="text-gray-600">
                      Granting access to{' '}
                      <span className="font-semibold text-gray-800">
                        {blockedSite?.url}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Access Granted
                    </h3>
                    <p className="text-gray-600 text-sm">
                      You now have{' '}
                      <span className="font-semibold text-gray-800">
                        {grantedDuration} minute
                        {grantedDuration !== 1 ? 's' : ''}
                      </span>{' '}
                      of access to
                    </p>
                    <p className="text-xs font-bold text-gray-800">
                      {blockedSite?.url}
                    </p>
                    <p className="text-sm text-gray-500 animate-pulse">
                      {countdown !== null
                        ? `Redirecting you in ${countdown}...`
                        : 'Redirecting you now...'}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Main Action Buttons */}
          {!showTimeSelector && !isGrantingAccess && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={closeTab}
                className="cursor-pointer flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-gray-400 to-gray-600 text-white font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <X className="size-5" />
                <span>Close tab</span>
              </button>

              <button
                onClick={showTimeSelectorHandler}
                className="cursor-pointer flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
              >
                {showTimeSelector ? 'Continue' : 'Let me continue'}
                <ArrowRight className="size-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">
          Powered by DeskLamp - Your Focus Companion
        </p>
      </div>
    </div>
  );
}
