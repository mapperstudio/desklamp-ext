import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Globe,
  ShieldBan,
  GlobeLock,
} from 'lucide-react';
import { BlockedSite } from '@/types/blockedsite.interface';

export default function SiteBlocker() {
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [isAddingSite, setIsAddingSite] = useState(true);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  // Load blocked sites from storage on component mount
  useEffect(() => {
    loadBlockedSites();
  }, []);

  const loadBlockedSites = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getBlockedSites',
      });
      setBlockedSites(response || []);
      setIsAddingSite(response?.length === 0);
    } catch {
      // Error loading blocked sites - silently continue
    }
  };

  const validateUrl = (url: string): string => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return 'Please enter a website URL';
    }

    // Check for basic domain pattern
    const domainPattern =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Clean the URL to check domain
    const cleanUrl = cleanAndNormalizeUrl(trimmedUrl);

    if (!domainPattern.test(cleanUrl)) {
      return 'Please enter a valid domain (e.g., facebook.com)';
    }

    // Check for minimum length
    if (cleanUrl.length < 3) {
      return 'Domain name is too short';
    }

    // Check for maximum length
    if (cleanUrl.length > 253) {
      return 'Domain name is too long';
    }

    // Check if site is already blocked
    const isAlreadyBlocked = blockedSites.some(
      site => site.url.toLowerCase() === cleanUrl.toLowerCase()
    );

    if (isAlreadyBlocked) {
      return 'This site is already blocked';
    }

    return '';
  };

  const addNewSite = async () => {
    const error = validateUrl(newSiteUrl);

    if (error) {
      setUrlError(error);
      return;
    }

    setUrlError('');
    const cleanUrl = cleanAndNormalizeUrl(newSiteUrl.trim());
    const siteName = extractSiteName(cleanUrl);

    try {
      const favicon = await fetchFavicon(cleanUrl);

      const response = await chrome.runtime.sendMessage({
        action: 'addBlockedSite',
        url: cleanUrl,
        name: siteName,
        favicon: favicon,
      });

      if (response?.success) {
        await loadBlockedSites(); // Reload the list
        setNewSiteUrl('');
        setIsAddingSite(blockedSites.length === 0);
      }
    } catch {
      setUrlError('Failed to add site. Please try again.');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSiteUrl(e.target.value);
    // Clear error when user starts typing
    if (urlError) {
      setUrlError('');
    }
  };

  const removeSite = async (id: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'removeBlockedSite',
        siteId: id,
      });

      if (response?.success) {
        await loadBlockedSites(); // Reload the list
      }
    } catch {
      // Error removing blocked site - silently continue
    }
  };

  const cleanAndNormalizeUrl = (url: string) => {
    // Remove protocol and www, extract domain
    let cleanUrl = url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
    return cleanUrl;
  };

  const extractSiteName = (url: string) => {
    // Extract domain name and capitalize first letter
    const domain = url.split('.')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  };

  const fetchFavicon = async (domain: string): Promise<string | undefined> => {
    try {
      // Try multiple favicon sources
      const faviconUrls = [
        `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        `https://${domain}/favicon.ico`,
        `https://${domain}/favicon.png`,
      ];

      // Return the first URL (Google's favicon service is most reliable)
      return faviconUrls[0];
    } catch {
      return undefined;
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/30 bg-white/50 backdrop-blur-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300 h-96 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GlobeLock className="text-gray-800 size-5" />
          <h2 className="text-gray-900 text-lg font-medium leading-tight">
            Site Blocker
          </h2>
        </div>

        <button
          onClick={() => setIsAddingSite(!isAddingSite)}
          className="flex items-center gap-2 w-fit p-2  text-blue-500 font-medium hover:bg-blue-500/10 transition-colors rounded-full"
        >
          <Plus className="size-4" />
          <span>Add site</span>
        </button>
      </div>

      {/* Add New Site Section */}
      <div className="space-y-3">
        {isAddingSite && (
          <div className="space-y-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center gap-3">
              <Globe className="size-4 text-gray-500" />
              <input
                type="text"
                placeholder="Website URL (e.g., facebook.com)"
                value={newSiteUrl}
                onChange={handleUrlChange}
                onKeyDown={e => e.key === 'Enter' && addNewSite()}
                className={`flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none ${
                  urlError ? 'text-red-600' : ''
                }`}
                autoFocus
              />
            </div>

            {urlError && <p className="text-red-500 text-sm">{urlError}</p>}

            <button
              onClick={addNewSite}
              disabled={!newSiteUrl.trim()}
              className="w-full py-2 bg-linear-to-r from-blue-400 to-blue-600 text-white font-medium rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Site
            </button>
          </div>
        )}
      </div>

      {/* Blocked Sites List */}
      <div className="flex-1 flex flex-col gap-3 py-4 max-h-64 overflow-y-auto">
        {blockedSites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShieldBan className="size-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No sites blocked yet</p>
            <p className="text-xs">
              Block distracting websites to stay focused
            </p>
          </div>
        ) : (
          blockedSites.map(site => (
            <div
              key={site.id}
              className="group flex items-center justify-between p-3 bg-white backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {site.favicon ? (
                    <img
                      src={site.favicon}
                      alt={`${site.name} favicon`}
                      className="size-5 rounded-sm"
                      onError={e => {
                        // Fallback to shield icon if favicon fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <Shield
                    className="size-4 text-gray-500"
                    style={{ display: site.favicon ? 'none' : 'block' }}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-900 text-sm font-medium">
                    {site.name}
                  </p>
                  <p className="text-gray-600 text-sm">{site.url}</p>
                </div>
              </div>
              <button
                onClick={() => removeSite(site.id)}
                className="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Remove site"
              >
                <Trash2 className="size-4 text-gray-400 hover:text-gray-700" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {blockedSites.length > 0 && (
        <div className="text-center pt-2 border-t border-white/20">
          <p className="text-xs text-gray-500">
            {blockedSites.length} site{blockedSites.length !== 1 ? 's' : ''}{' '}
            blocked
          </p>
        </div>
      )}
    </div>
  );
}
