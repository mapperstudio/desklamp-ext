// Background script for site blocking functionality
import { FocusModeState } from '../types/focusmode.interface';

export interface BlockedSite {
  id: string;
  url: string;
  name: string;
  favicon?: string;
}

interface TemporaryUnblock {
  url: string;
  expiresAt: number;
  originalDuration: number; // Store original duration for progress calculation
}

// FocusModeState interface is now imported from types/focusmode.interface.ts

interface HydrationState {
  currentLiters: number;
  goalLiters: number;
  lastResetDate: string; // YYYY-MM-DD format
}

interface Task {
  id: string;
  title: string;
  details?: string;
  dueDate?: Date;
  dueTime?: string;
  completed: boolean;
  completedDate?: string;
}

// Storage keys
const STORAGE_KEY = 'desklamp_blocked_sites';
const TEMP_UNBLOCK_KEY = 'desklamp_temp_unblocks';
const FOCUS_MODE_KEY = 'desklamp_focus_mode';
const HYDRATION_KEY = 'desklamp_hydration';
const TASKS_KEY = 'desklamp_tasks';

// Cache for synchronous access
let blockedSitesCache: BlockedSite[] = [];
let tempUnblocksCache: TemporaryUnblock[] = [];
let lastCacheUpdate = 0;
const CACHE_TTL = 5000; // 5 seconds

// Get blocked sites from storage
async function getBlockedSites(): Promise<BlockedSite[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

// Save blocked sites to storage
async function saveBlockedSites(sites: BlockedSite[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: sites });
}

// Get temporary unblocks from storage
async function getTemporaryUnblocks(): Promise<TemporaryUnblock[]> {
  const result = await chrome.storage.local.get(TEMP_UNBLOCK_KEY);
  return result[TEMP_UNBLOCK_KEY] || [];
}

// Focus Mode storage functions
async function getFocusModeState(): Promise<FocusModeState | null> {
  const result = await chrome.storage.local.get(FOCUS_MODE_KEY);
  return result[FOCUS_MODE_KEY] || null;
}

// Hydration storage functions
async function getHydrationState(): Promise<HydrationState | null> {
  const result = await chrome.storage.local.get(HYDRATION_KEY);
  return result[HYDRATION_KEY] || null;
}

async function saveHydrationState(state: HydrationState): Promise<void> {
  await chrome.storage.local.set({ [HYDRATION_KEY]: state });
}

async function getOrCreateHydrationState(): Promise<HydrationState> {
  const state = await getHydrationState();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  if (!state || state.lastResetDate !== today) {
    // Reset for new day
    const newState: HydrationState = {
      currentLiters: 0,
      goalLiters: 2.0,
      lastResetDate: today,
    };
    await saveHydrationState(newState);
    return newState;
  }

  return state;
}

// Task storage functions
async function getTasks(): Promise<Task[]> {
  const result = await chrome.storage.local.get(TASKS_KEY);
  return result[TASKS_KEY] || [];
}

async function saveTasks(tasks: Task[]): Promise<void> {
  await chrome.storage.local.set({ [TASKS_KEY]: tasks });
}

// Save temporary unblocks to storage
async function saveTemporaryUnblocks(
  unblocks: TemporaryUnblock[]
): Promise<void> {
  await chrome.storage.local.set({ [TEMP_UNBLOCK_KEY]: unblocks });
}

async function saveFocusModeState(state: FocusModeState): Promise<void> {
  await chrome.storage.local.set({ [FOCUS_MODE_KEY]: state });
  lastCacheUpdate = Date.now();
}

// Add a temporary unblock
async function addTemporaryUnblock(
  url: string,
  durationMs: number
): Promise<void> {
  const unblocks = await getTemporaryUnblocks();
  const expiresAt = Date.now() + durationMs;

  // Remove any existing temporary unblock for this URL
  const filteredUnblocks = unblocks.filter(unblock => unblock.url !== url);

  // Add new temporary unblock
  const newUnblock = { url, expiresAt, originalDuration: durationMs };
  filteredUnblocks.push(newUnblock);

  await saveTemporaryUnblocks(filteredUnblocks);

  // Immediately update the cache with the new data
  tempUnblocksCache = filteredUnblocks;
  lastCacheUpdate = Date.now();
}

// Clean up expired temporary unblocks
async function cleanupExpiredUnblocks(): Promise<void> {
  const unblocks = await getTemporaryUnblocks();
  const now = Date.now();
  const activeUnblocks = unblocks.filter(unblock => unblock.expiresAt > now);

  if (activeUnblocks.length !== unblocks.length) {
    await saveTemporaryUnblocks(activeUnblocks);
  }
}

// Update cache with latest data
async function updateCache(): Promise<void> {
  const now = Date.now();
  if (now - lastCacheUpdate < CACHE_TTL) {
    return; // Cache is still fresh
  }

  const [blockedSites, tempUnblocks] = await Promise.all([
    getBlockedSites(),
    getTemporaryUnblocks(),
  ]);

  // Clean up expired temporary unblocks
  const activeUnblocks = tempUnblocks.filter(
    unblock => unblock.expiresAt > now
  );
  if (activeUnblocks.length !== tempUnblocks.length) {
    await saveTemporaryUnblocks(activeUnblocks);
    tempUnblocksCache = activeUnblocks;
  } else {
    tempUnblocksCache = tempUnblocks;
  }

  blockedSitesCache = blockedSites;
  lastCacheUpdate = now;
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    // If URL doesn't have protocol, add https://
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);
    return urlObj.hostname.toLowerCase();
  } catch {
    return '';
  }
}

// Extract site name from URL (capitalized first part of domain)
function extractSiteName(url: string): string {
  const domain = extractDomain(url);
  return (
    domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
  );
}

// Check if URL should be blocked
async function _shouldBlockUrl(
  url: string,
  blockedSites: BlockedSite[]
): Promise<boolean> {
  const domain = extractDomain(url);

  // Check if site is in blocked list
  const isBlocked = blockedSites.some(site => {
    const siteDomain = extractDomain(site.url);
    return domain === siteDomain || domain.endsWith('.' + siteDomain);
  });

  if (!isBlocked) {
    return false;
  }

  // Check if there's a temporary unblock for this URL
  await cleanupExpiredUnblocks();
  const tempUnblocks = await getTemporaryUnblocks();

  return !tempUnblocks.some(unblock => {
    const unblockDomain = extractDomain(unblock.url);
    return domain === unblockDomain || domain.endsWith('.' + unblockDomain);
  });
}

// Redirect to block screen
function redirectToBlockScreen(url: string, siteName: string): void {
  // Use the path that's defined in web_accessible_resources
  // This works for both development and production builds
  const blockUrl = chrome.runtime.getURL('src/block/index.html');
  const params = new URLSearchParams({
    url: url,
    name: siteName,
  });

  chrome.tabs.update({
    url: `${blockUrl}?${params.toString()}`,
  });
}

// Check and block all tabs if needed
async function checkAndBlockAllTabs() {
  try {
    // Get current Focus Mode state
    const focusModeState = await getFocusModeState();
    if (!focusModeState?.isActive || focusModeState.isPaused) {
      return; // Don't block if Focus Mode is not active
    }

    // Get all tabs
    const tabs = await chrome.tabs.query({});

    for (const tab of tabs) {
      if (
        !tab.url ||
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://')
      ) {
        continue; // Skip chrome internal pages and extension pages
      }

      // Check if tab should be blocked
      const currentDomain = extractDomain(tab.url);
      const isBlocked = blockedSitesCache.some(site => {
        const siteDomain = extractDomain(site.url);

        // Remove www. prefix for comparison
        const normalizedCurrentDomain = currentDomain.replace(/^www\./, '');
        const normalizedSiteDomain = siteDomain.replace(/^www\./, '');

        return (
          normalizedCurrentDomain === normalizedSiteDomain ||
          normalizedCurrentDomain.endsWith('.' + normalizedSiteDomain)
        );
      });

      if (isBlocked) {
        // Check for temporary unblock
        const now = Date.now();
        const hasTempUnblock = tempUnblocksCache.some(unblock => {
          const unblockDomain = extractDomain(unblock.url);

          // Remove www. prefix for comparison
          const normalizedCurrentDomain = currentDomain.replace(/^www\./, '');
          const normalizedUnblockDomain = unblockDomain.replace(/^www\./, '');

          return (
            (normalizedCurrentDomain === normalizedUnblockDomain ||
              normalizedCurrentDomain.endsWith(
                '.' + normalizedUnblockDomain
              )) &&
            unblock.expiresAt > now
          );
        });

        if (!hasTempUnblock) {
          const siteName = extractSiteName(tab.url);
          chrome.tabs.update(tab.id!, {
            url: `${chrome.runtime.getURL('src/block/index.html')}?${new URLSearchParams(
              {
                url: tab.url,
                name: siteName,
              }
            ).toString()}`,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking and blocking all tabs:', error);
  }
}

// Listen for new tab creation to immediately block if needed
chrome.tabs.onCreated.addListener(async tab => {
  // Small delay to ensure tab is fully loaded
  setTimeout(async () => {
    await checkAndBlockAllTabs();
  }, 200);
});

// Listen for tab updates (URL changes) to block if needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Small delay to ensure tab is fully loaded
    setTimeout(async () => {
      await checkAndBlockAllTabs();
    }, 100);
  }
});

// Handle web navigation blocking using onBeforeNavigate
chrome.webNavigation.onBeforeNavigate.addListener(
  async function (details) {
    // Only handle main frame navigations
    if (details.frameId !== 0) {
      return;
    }

    // Check if Focus Mode is active before blocking sites
    const focusModeState = await getFocusModeState();
    if (
      !focusModeState ||
      !focusModeState.isActive ||
      focusModeState.isPaused
    ) {
      return; // Don't block sites if Focus Mode is not active
    }

    // Update cache if needed
    await updateCache();

    const domain = extractDomain(details.url);

    // Use cached data for checking
    const isBlocked = blockedSitesCache.some(site => {
      const siteDomain = extractDomain(site.url);

      // Remove www. prefix for comparison
      const normalizedDomain = domain.replace(/^www\./, '');
      const normalizedSiteDomain = siteDomain.replace(/^www\./, '');

      return (
        normalizedDomain === normalizedSiteDomain ||
        normalizedDomain.endsWith('.' + normalizedSiteDomain)
      );
    });

    if (isBlocked) {
      // Check if there's a temporary unblock for this URL
      const now = Date.now();
      const hasTempUnblock = tempUnblocksCache.some(unblock => {
        const unblockDomain = extractDomain(unblock.url);

        // Remove www. prefix for comparison
        const normalizedDomain = domain.replace(/^www\./, '');
        const normalizedUnblockDomain = unblockDomain.replace(/^www\./, '');

        return (
          (normalizedDomain === normalizedUnblockDomain ||
            normalizedDomain.endsWith('.' + normalizedUnblockDomain)) &&
          unblock.expiresAt > now
        );
      });

      if (!hasTempUnblock) {
        const siteName = extractSiteName(details.url);
        redirectToBlockScreen(details.url, siteName);
      }
    }
  },
  { url: [{ schemes: ['http', 'https'] }] }
);

// Update extension badge with countdown timer
function updateExtensionBadge(
  timeInSeconds: number,
  isPaused: boolean = false
) {
  if (timeInSeconds <= 0) {
    // Hide badge when timer is at 0
    chrome.action.setBadgeText({
      text: '',
    });
    return;
  }

  chrome.action.setBadgeBackgroundColor({
    color: '#364153',
  });

  let formattedTime: string;
  if (isPaused) {
    // Show "Paused" when timer is paused
    formattedTime = '▶︎';
  } else if (timeInSeconds < 60) {
    // Less than a minute: show as "30s"
    formattedTime = `${timeInSeconds}s`;
  } else {
    // Convert to minutes
    const minutes = Math.floor(timeInSeconds / 60);
    formattedTime = `${minutes.toString().padStart(2, '0')}m`;
  }

  chrome.action.setBadgeText({
    text: formattedTime,
  });
}

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getBlockedSites') {
    getBlockedSites().then(sites => sendResponse(sites));
    return true; // Keep message channel open for async response
  }

  if (message.action === 'addBlockedSite') {
    getBlockedSites().then(async sites => {
      const newSite: BlockedSite = {
        id: Date.now().toString(),
        url: message.url,
        name: message.name,
        favicon: message.favicon,
      };

      sites.push(newSite);
      await saveBlockedSites(sites);

      // Force update cache immediately (bypass TTL)
      const [blockedSites, tempUnblocks] = await Promise.all([
        getBlockedSites(),
        getTemporaryUnblocks(),
      ]);
      blockedSitesCache = blockedSites;
      tempUnblocksCache = tempUnblocks;
      lastCacheUpdate = Date.now();

      // Immediately check and block all tabs
      await checkAndBlockAllTabs();

      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'removeBlockedSite') {
    getBlockedSites().then(async sites => {
      const filteredSites = sites.filter(site => site.id !== message.siteId);
      await saveBlockedSites(filteredSites);

      // Force update cache immediately (bypass TTL)
      const [blockedSites, tempUnblocks] = await Promise.all([
        getBlockedSites(),
        getTemporaryUnblocks(),
      ]);
      blockedSitesCache = blockedSites;
      tempUnblocksCache = tempUnblocks;
      lastCacheUpdate = Date.now();

      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'temporaryUnblock') {
    addTemporaryUnblock(message.url, message.duration)
      .then(async () => {
        // Small delay to ensure cache is fully updated before responding
        setTimeout(() => {
          sendResponse({ success: true });
        }, 100);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (message.action === 'getTemporaryUnblocks') {
    getTemporaryUnblocks().then(unblocks => {
      // Filter out expired unblocks
      const now = Date.now();
      const activeUnblocks = unblocks.filter(
        unblock => unblock.expiresAt > now
      );
      sendResponse(activeUnblocks);
    });
    return true;
  }

  if (message.action === 'removeTemporaryUnblock') {
    getTemporaryUnblocks().then(async unblocks => {
      // Remove the specific temporary unblock
      const filteredUnblocks = unblocks.filter(
        unblock => unblock.url !== message.url
      );
      await saveTemporaryUnblocks(filteredUnblocks);

      // Immediately update the cache with the new data
      tempUnblocksCache = filteredUnblocks;
      lastCacheUpdate = Date.now();

      // Handle redirect if requested
      if (message.redirectToBlock) {
        const siteName = extractSiteName(message.url);
        redirectToBlockScreen(message.url, siteName);
      }

      sendResponse({ success: true });
    });
    return true;
  }

  // Focus Mode message handlers
  if (message.action === 'getFocusModeState') {
    getFocusModeState().then(state => {
      if (state && state.isActive && state.sessionStartTime) {
        // Calculate current remaining time
        const elapsed = Math.floor(
          (Date.now() - state.sessionStartTime) / 1000
        );
        const currentRemainingTime = Math.max(
          0,
          state.originalDuration - elapsed
        );

        if (currentRemainingTime <= 0) {
          // Session completed
          const completedState = {
            ...state,
            isActive: false,
            sessionStartTime: null,
            originalDuration: 0,
          };
          saveFocusModeState(completedState);
          updateExtensionBadge(0, false);
          sendResponse({
            success: true,
            state: completedState,
            remainingTime: 0,
            formattedTime: '00:00',
          });
        } else {
          const updatedState = {
            ...state,
          };
          sendResponse({
            success: true,
            state: updatedState,
            remainingTime: currentRemainingTime,
            formattedTime: formatTime(currentRemainingTime),
          });
        }
      } else {
        sendResponse({
          success: true,
          state: state,
          remainingTime: 0,
          formattedTime: '00:00',
        });
      }
    });
    return true;
  }

  if (message.action === 'updateFocusModeState') {
    saveFocusModeState(message.state).then(async () => {
      // Immediately check and block all tabs when Focus Mode starts
      await checkAndBlockAllTabs();

      // Update extension badge
      if (
        message.state.isActive &&
        !message.state.isPaused &&
        message.state.sessionStartTime
      ) {
        const elapsed = Math.floor(
          (Date.now() - message.state.sessionStartTime) / 1000
        );
        const currentRemainingTime = Math.max(
          0,
          message.state.originalDuration - elapsed
        );
        updateExtensionBadge(currentRemainingTime, false);
      } else {
        updateExtensionBadge(0, false);
      }

      // Broadcast state change to all tabs
      broadcastFocusModeStateChange(message.state);

      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'redirectToBlockScreen') {
    redirectToBlockScreen(message.url, message.name);
    sendResponse({ success: true });
    return true;
  }

  // Hydration message handlers
  if (message.action === 'getHydrationState') {
    getOrCreateHydrationState().then(state => {
      sendResponse(state);
    });
    return true;
  }

  if (message.action === 'updateHydrationState') {
    saveHydrationState(message.state).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'getTasks') {
    getTasks().then(tasks => {
      sendResponse(tasks);
    });
    return true;
  }

  if (message.action === 'saveTasks') {
    saveTasks(message.tasks).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'testNotification') {
    testNotification().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'testTimerCompletion') {
    // Manually trigger timer completion for testing
    console.log('Manually triggering timer completion...');
    chrome.notifications
      .create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('public/logo.png'),
        title: 'Focus Session Complete! 🎉',
        message: 'Great work! Time to take a break and recharge.',
        buttons: [{ title: 'Take a Break' }, { title: 'Start New Session' }],
        priority: 2,
      })
      .then(() => {
        console.log('Manual timer completion notification created');
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Failed to create manual notification:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Initialize cache when service worker starts
updateCache();

// Update cache periodically
setInterval(updateCache, 10000); // Update every 10 seconds

// Helper function to format time
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to broadcast focus mode state changes to all tabs
async function broadcastFocusModeStateChange(state: FocusModeState) {
  try {
    console.log('Broadcasting focus mode state change:', state);

    // Store the state change timestamp to trigger updates
    await chrome.storage.local.set({
      focusModeStateChange: Date.now(),
      focusModeState: state,
    });

    console.log('Stored state change in storage');
  } catch (error) {
    console.error('Error broadcasting focus mode state change:', error);
  }
}

// Helper function to navigate to focus page or create new tab
async function navigateToFocusPage() {
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

// Helper function to navigate to break page or create new tab
async function navigateToBreakPage() {
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

// Handle extension icon click - open new tab
chrome.action.onClicked.addListener(_tab => {
  chrome.tabs.create({});
});

// Update Focus Mode badge and state periodically
setInterval(async () => {
  const state = await getFocusModeState();

  if (state && state.isActive && state.sessionStartTime && !state.isPaused) {
    const elapsed = Math.floor((Date.now() - state.sessionStartTime) / 1000);
    const currentRemainingTime = Math.max(0, state.originalDuration - elapsed);

    console.log('Timer check:', {
      sessionStartTime: state.sessionStartTime,
      originalDuration: state.originalDuration,
      elapsed,
      currentRemainingTime,
      now: Date.now(),
    });

    if (currentRemainingTime <= 0) {
      // Session completed - send notification
      console.log('Focus session completed, sending notification...');
      const completedState = {
        ...state,
        isActive: false,
        remainingTime: 0,
        sessionStartTime: null,
        originalDuration: 0,
      };
      await saveFocusModeState(completedState);
      updateExtensionBadge(0, false);

      // Send break reminder notification
      try {
        // Check notification permission first
        const permission = await chrome.notifications.getPermissionLevel();
        console.log('Notification permission level:', permission);

        if (permission !== 'granted') {
          console.error('Notification permission not granted:', permission);
          return;
        }

        await chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('public/logo.png'),
          title: 'Focus Session Complete! 🎉',
          message: 'Great work! Time to take a break and recharge.',
          buttons: [{ title: 'Take a Break' }, { title: 'Start New Session' }],
          priority: 2,
        });
        console.log('Notification created successfully');
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    } else {
      // Just update badge, don't modify stored state
      updateExtensionBadge(currentRemainingTime, false);
    }
  } else if (state && state.isActive) {
    // Calculate remaining time for paused state
    const elapsed = Math.floor(
      (Date.now() - (state.sessionStartTime || 0)) / 1000
    );
    const currentRemainingTime = Math.max(0, state.originalDuration - elapsed);
    updateExtensionBadge(currentRemainingTime, true); // Paused state
  }
}, 1000); // Update every second

// Handle notification clicks
chrome.notifications.onClicked.addListener(notificationId => {
  navigateToBreakPage();
  chrome.notifications.clear(notificationId);
});

chrome.notifications.onButtonClicked.addListener(
  (notificationId, buttonIndex) => {
    chrome.notifications.clear(notificationId);

    if (buttonIndex === 0) {
      // "Take a Break" button
      navigateToBreakPage();
    } else if (buttonIndex === 1) {
      // "Start New Session" button
      navigateToFocusPage();
    }
  }
);

// Test notification function (for debugging)
async function testNotification() {
  try {
    // Check notification permission first
    const permission = await chrome.notifications.getPermissionLevel();
    console.log('Notification permission level:', permission);

    if (permission !== 'granted') {
      console.error('Notification permission not granted:', permission);
      return;
    }

    // Try simple notification first
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('public/logo.png'),
      title: 'Test Notification 🧪',
      message: 'This is a test notification to verify the system works.',
    });
    console.log('Simple test notification created successfully');

    // Try with icon
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('public/logo.png'),
      title: 'Test Notification with Icon 🧪',
      message: 'This notification includes the extension icon.',
      buttons: [{ title: 'Take a Break' }, { title: 'Start New Session' }],
      priority: 2,
    });
    console.log('Full test notification created successfully');
  } catch (error) {
    console.error('Failed to create test notification:', error);
  }
}
