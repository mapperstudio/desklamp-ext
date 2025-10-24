import { useState, useEffect, useRef } from 'react';
import './App.css';

interface TemporaryUnblock {
  url: string;
  expiresAt: number;
  originalDuration?: number; // Store original duration for progress calculation
}

function App() {
  const [temporaryUnblock, setTemporaryUnblock] =
    useState<TemporaryUnblock | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [timerPosition, setTimerPosition] = useState<{
    top: string | number;
    bottom: string | number;
  }>({
    top: '1rem',
    bottom: 'auto',
  });
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);

  // Ref to track the timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check Focus Mode status
  useEffect(() => {
    const checkFocusMode = () => {
      try {
        chrome.runtime.sendMessage(
          { action: 'getFocusModeState' },
          response => {
            if (chrome.runtime.lastError) {
              console.log(
                'Content script - Extension context invalidated, skipping focus mode check'
              );
              return;
            }
            console.log('Content script - Focus mode response:', response);
            if (response && response.success && response.state) {
              const isActive =
                response.state.isActive && !response.state.isPaused;
              console.log(
                'Content script - Setting focus mode active:',
                isActive
              );
              setIsFocusModeActive(isActive);
            }
          }
        );
      } catch (error) {
        console.log('Content script - Error checking focus mode:', error);
      }
    };

    // Check immediately
    checkFocusMode();

    // Check every 5 seconds
    const interval = setInterval(checkFocusMode, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if current site has temporary unblock
    const checkTemporaryUnblock = async (retryCount = 0) => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'getTemporaryUnblocks',
        });

        if (chrome.runtime.lastError) {
          console.log(
            'Content script - Extension context invalidated, skipping temporary unblock check'
          );
          return;
        }

        if (response && response.length > 0) {
          const currentUrl = window.location.href;
          const currentDomain = extractDomain(currentUrl);

          const activeUnblock = response.find((unblock: TemporaryUnblock) => {
            const unblockDomain = extractDomain(unblock.url);
            return (
              (currentDomain === unblockDomain ||
                currentDomain.endsWith('.' + unblockDomain)) &&
              unblock.expiresAt > Date.now()
            );
          });

          if (activeUnblock) {
            console.log(
              'Content script - Found active unblock:',
              activeUnblock
            );
            // Calculate original duration if not present
            const unblockWithDuration = {
              ...activeUnblock,
              originalDuration:
                activeUnblock.originalDuration ||
                activeUnblock.expiresAt - Date.now(),
            };
            setTemporaryUnblock(unblockWithDuration);
            // Initialize time remaining
            const initialRemaining = Math.max(
              0,
              unblockWithDuration.expiresAt - Date.now()
            );
            setTimeRemaining(initialRemaining);
          } else if (retryCount < 3) {
            // Retry after a short delay if no unblock found
            setTimeout(() => checkTemporaryUnblock(retryCount + 1), 500);
          }
        } else if (retryCount < 3) {
          // Retry after a short delay if no response
          setTimeout(() => checkTemporaryUnblock(retryCount + 1), 500);
        }
      } catch {
        // Silently handle errors, but retry if we haven't exceeded retry count
        if (retryCount < 3) {
          setTimeout(() => checkTemporaryUnblock(retryCount + 1), 500);
        }
      }
    };

    checkTemporaryUnblock();

    // Set up periodic check to catch temporary unblocks created after page load
    const periodicCheck = setInterval(() => {
      if (!temporaryUnblock) {
        checkTemporaryUnblock();
      }
    }, 2000); // Check every 2 seconds if no temporary unblock is active

    return () => {
      clearInterval(periodicCheck);
    };
  }, []); // Only run once on mount

  // Separate effect for timer management
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!temporaryUnblock) {
      return; // No timer needed if no temporary unblock
    }

    // Update timer every second
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, temporaryUnblock.expiresAt - now);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Clear timer immediately
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Reset all states immediately
        setTemporaryUnblock(null);
        setTimeRemaining(0);
        setIsDragging(false);

        // Send message to background worker to handle redirect
        try {
          chrome.runtime.sendMessage({
            action: 'redirectToBlockScreen',
            url: window.location.href,
            name: extractSiteName(window.location.href),
          });
        } catch (error) {
          console.log(
            'Content script - Error sending redirect message:',
            error
          );
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [temporaryUnblock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Reset states
      setTemporaryUnblock(null);
      setTimeRemaining(0);
      setIsDragging(false);

      // Restore cursor and selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  // Initialize time remaining when temporaryUnblock changes
  useEffect(() => {
    if (temporaryUnblock) {
      const initialRemaining = Math.max(
        0,
        temporaryUnblock.expiresAt - Date.now()
      );
      setTimeRemaining(initialRemaining);
    } else {
      setTimeRemaining(0);
    }
  }, [temporaryUnblock]);

  // Add smooth mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();

      document.addEventListener('mousemove', handleGlobalMouseMove, {
        passive: true,
      });
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  // Drag handlers with improved smoothness
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    e.preventDefault();

    // Add smooth cursor change
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const windowHeight = window.innerHeight;
    const timerHeight = 80; // Height of the timer circle
    const padding = 20; // Padding from edges

    // Calculate new position with smoother boundaries
    let newBottom: string | number = Math.max(
      padding,
      Math.min(
        windowHeight - padding - timerHeight,
        windowHeight - e.clientY - timerHeight / 2
      )
    );
    let newTop: string | number = 'auto';

    // If dragging near the top, switch to top positioning
    if (e.clientY < timerHeight + padding) {
      newTop = Math.max(
        padding,
        Math.min(
          windowHeight - padding - timerHeight,
          e.clientY - timerHeight / 2
        )
      );
      newBottom = 'auto';
    }

    setTimerPosition({ top: newTop, bottom: newBottom });
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Restore cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const handleBlockWebsite = () => {
    if (!temporaryUnblock) return;

    // Clear the timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset states immediately for better UX
    setTemporaryUnblock(null);
    setTimeRemaining(0);
    setIsDragging(false);

    // Send message to background script to remove temporary unblock and handle redirect
    try {
      chrome.runtime.sendMessage(
        {
          action: 'removeTemporaryUnblock',
          url: temporaryUnblock.url,
          redirectToBlock: true,
        },
        response => {
          if (chrome.runtime.lastError) {
            console.log(
              'Content script - Extension context invalidated, skipping block website message'
            );
            return;
          }
          if (!response?.success) {
            // Could restore state here if needed, but for now we keep it cleared
          }
        }
      );
    } catch (error) {
      console.log(
        'Content script - Error sending block website message:',
        error
      );
    }
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStartY]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clear the timer interval when component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];
    }
  };

  const extractSiteName = (url: string): string => {
    const domain = extractDomain(url);
    return (
      domain.split('.')[0].charAt(0).toUpperCase() +
      domain.split('.')[0].slice(1)
    );
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress angle for the circular progress bar
  const calculateProgressAngle = (): number => {
    if (!temporaryUnblock || !temporaryUnblock.originalDuration) return 0;

    const totalDuration = temporaryUnblock.originalDuration;
    const remaining = timeRemaining;
    const elapsed = totalDuration - remaining;
    const progress = Math.max(0, Math.min(1, elapsed / totalDuration));

    // Convert progress to degrees (0-360)
    return progress * 360;
  };

  return (
    <div className="popup-container">
      {/* Rectangular Countdown Widget - only show when Focus Mode is active */}
      {isFocusModeActive && temporaryUnblock && (
        <div
          className="widget-container"
          style={{
            top: timerPosition.top,
            bottom: timerPosition.bottom,
          }}
        >
          <div
            className={`countdown-widget ${isDragging ? 'dragging' : ''}`}
            style={
              {
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
              } as React.CSSProperties
            }
            onMouseDown={handleMouseDown}
          >
            <div className="countdown-content">
              {/* Circular icon */}
              <div className="countdown-icon">
                <button
                  onClick={handleBlockWebsite}
                  className="block-button"
                  title="Block this website now"
                >
                  {/* Shield Icon */}
                  {/* Shield Block SVG (shield with block/slash) */}
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    style={{ display: 'inline', verticalAlign: 'middle' }}
                  >
                    <path
                      d="M12 3L4 6.5V12.5C4 17 8.58 20.91 12 21C15.42 20.91 20 17 20 12.5V6.5L12 3Z"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {/* Diagonal block slash */}
                    <line
                      x1="8"
                      y1="16"
                      x2="16"
                      y2="8"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              {/* Time display */}
              <div className="countdown-time">{formatTime(timeRemaining)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
