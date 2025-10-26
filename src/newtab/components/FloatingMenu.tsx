import React, { useState, useEffect } from 'react';
import { Settings, Keyboard, ChevronDown } from 'lucide-react';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FloatingMenuProps {
  onSettingsClick: () => void;
}

interface Shortcut {
  action: string;
  keys: string[];
}

export default function FloatingMenu({ onSettingsClick }: FloatingMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

  // Fetch shortcuts from worker
  useEffect(() => {
    const fetchShortcuts = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'getKeyboardShortcuts',
        });

        if (response.success) {
          setShortcuts(response.shortcuts);
        }
      } catch (error) {
        console.error('Failed to fetch shortcuts:', error);
        // Fallback shortcuts if worker is not available
        setShortcuts([
          {
            action: 'Navigate to focus page or create new tab',
            keys: ['Ctrl', 'F'],
          },
          {
            action: 'Navigate to break page or create new tab',
            keys: ['Ctrl', 'B'],
          },
          { action: 'Open extension new tab page', keys: ['Ctrl', 'T'] },
          {
            action: 'Open extension options page',
            keys: ['Ctrl', 'Shift', 'S'],
          },
          { action: 'Toggle floating menu', keys: ['Ctrl', 'M'] },
        ]);
      }
    };

    fetchShortcuts();
  }, []);

  // Handle keyboard shortcut for menu toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        setIsExpanded(!isExpanded);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Menu */}
      <div className="flex flex-col items-end gap-2">
        {/* Expanded Menu Items */}
        {isExpanded && (
          <div className="flex flex-col gap-2">
            <Popover open={showShortcuts} onOpenChange={setShowShortcuts}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-lg border border-white/40 rounded-lg shadow-lg hover:bg-white/90 transition-all duration-200 text-sm text-gray-700 hover:text-gray-900">
                  <Keyboard className="w-4 h-4" />
                  Shortcuts
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-4 bg-white/95 backdrop-blur-lg border border-white/40 shadow-xl"
                side="top"
                align="end"
                sideOffset={8}
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-700">{shortcut.action}</span>
                      <KbdGroup>
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <Kbd>{key}</Kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-400">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </KbdGroup>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-lg border border-white/40 rounded-full shadow-lg hover:bg-white/90 transition-all duration-200 group"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
          ) : (
            <Settings className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
          )}
        </button>

        {/* Settings Button (always visible when expanded) */}
        {isExpanded && (
          <button
            onClick={onSettingsClick}
            className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-lg border border-white/40 rounded-lg shadow-lg hover:bg-white/90 transition-all duration-200 text-sm text-gray-700 hover:text-gray-900"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        )}
      </div>
    </div>
  );
}
