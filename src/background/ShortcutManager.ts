// Keyboard Shortcut Management System
export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  action: () => Promise<void>;
}

export class ShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();

  constructor() {
    this.initializeShortcuts();
    this.setupCommandListeners();
  }

  private initializeShortcuts() {
    // Focus page shortcut
    this.registerShortcut({
      id: 'focus-page',
      name: 'Open Focus Page',
      description: 'Navigate to focus page or create new tab',
      keys: ['Ctrl', 'F'],
      action: async () => {
        await this.navigateToFocusPage();
      },
    });

    // Break page shortcut
    this.registerShortcut({
      id: 'break-page',
      name: 'Open Break Page',
      description: 'Navigate to break page or create new tab',
      keys: ['Ctrl', 'B'],
      action: async () => {
        await this.navigateToBreakPage();
      },
    });

    // New tab shortcut
    this.registerShortcut({
      id: 'newtab',
      name: 'Open New Tab',
      description: 'Open extension new tab page',
      keys: ['Ctrl', 'T'],
      action: async () => {
        await this.openNewTab();
      },
    });

    // Settings shortcut
    this.registerShortcut({
      id: 'settings',
      name: 'Open Settings',
      description: 'Open extension options page',
      keys: ['Ctrl', 'Shift', 'S'],
      action: async () => {
        await chrome.runtime.openOptionsPage();
      },
    });
  }

  private registerShortcut(shortcut: KeyboardShortcut) {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  private setupCommandListeners() {
    chrome.commands.onCommand.addListener(async command => {
      console.log('Command received:', command);

      switch (command) {
        case 'focus-page':
          await this.executeShortcut('focus-page');
          break;
        case 'break-page':
          await this.executeShortcut('break-page');
          break;
        case 'newtab':
          await this.executeShortcut('newtab');
          break;
        case 'settings':
          await this.executeShortcut('settings');
          break;
        default:
          console.warn('Unknown command:', command);
      }
    });
  }

  public async executeShortcut(shortcutId: string) {
    const shortcut = this.shortcuts.get(shortcutId);
    if (shortcut) {
      try {
        await shortcut.action();
        console.log(`Executed shortcut: ${shortcut.name}`);
      } catch (error) {
        console.error(`Error executing shortcut ${shortcutId}:`, error);
      }
    } else {
      console.warn(`Shortcut not found: ${shortcutId}`);
    }
  }

  private async navigateToFocusPage() {
    const desklampUrl = chrome.runtime.getURL('src/newtab/index.html');
    const focusUrl = chrome.runtime.getURL(
      'src/newtab/index.html#/dashboard/focus'
    );

    try {
      // Get all tabs
      const tabs = await chrome.tabs.query({});

      // Look for existing Desklamp tab
      const existingTab = tabs.find(
        tab => tab.url && tab.url.startsWith(desklampUrl)
      );

      if (existingTab && existingTab.id) {
        // Navigate existing tab to focus page
        await chrome.tabs.update(existingTab.id, {
          url: focusUrl,
          active: true,
        });
      } else {
        // Create new tab
        await chrome.tabs.create({
          url: focusUrl,
          active: true,
        });
      }
    } catch (error) {
      console.error('Error navigating to focus page:', error);
      // Fallback: create new tab
      await chrome.tabs.create({
        url: focusUrl,
        active: true,
      });
    }
  }

  private async navigateToBreakPage() {
    const desklampUrl = chrome.runtime.getURL('src/newtab/index.html');
    const breakUrl = chrome.runtime.getURL(
      'src/newtab/index.html#/dashboard/break'
    );

    try {
      // Get all tabs
      const tabs = await chrome.tabs.query({});

      // Look for existing Desklamp tab
      const existingTab = tabs.find(
        tab => tab.url && tab.url.startsWith(desklampUrl)
      );

      if (existingTab && existingTab.id) {
        // Navigate existing tab to break page
        await chrome.tabs.update(existingTab.id, {
          url: breakUrl,
          active: true,
        });
      } else {
        // Create new tab
        await chrome.tabs.create({
          url: breakUrl,
          active: true,
        });
      }
    } catch (error) {
      console.error('Error navigating to break page:', error);
      // Fallback: create new tab
      await chrome.tabs.create({
        url: breakUrl,
        active: true,
      });
    }
  }

  private async openNewTab() {
    const newtabUrl = chrome.runtime.getURL('src/newtab/index.html');

    try {
      // Get all tabs
      const tabs = await chrome.tabs.query({});

      // Look for existing Desklamp tab
      const existingTab = tabs.find(
        tab => tab.url && tab.url.startsWith(newtabUrl)
      );

      if (existingTab && existingTab.id) {
        // Focus existing tab
        await chrome.tabs.update(existingTab.id, {
          active: true,
        });
      } else {
        // Create new tab
        await chrome.tabs.create({
          url: newtabUrl,
          active: true,
        });
      }
    } catch (error) {
      console.error('Error opening new tab:', error);
      // Fallback: create new tab
      await chrome.tabs.create({
        url: newtabUrl,
        active: true,
      });
    }
  }

  // Get all shortcuts for display purposes
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  // Get shortcuts formatted for UI display
  getShortcutsForUI(): Array<{ action: string; keys: string[] }> {
    return this.getAllShortcuts().map(shortcut => ({
      action: shortcut.description,
      keys: shortcut.keys,
    }));
  }
}
