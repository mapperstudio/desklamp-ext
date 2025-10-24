// Lightweight domain checking utility
export function extractDomain(url: string): string {
  try {
    // If URL doesn't have protocol, add https://
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);
    return urlObj.hostname.toLowerCase();
  } catch {
    return '';
  }
}

export async function checkIfSiteIsBlocked(): Promise<boolean> {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getBlockedSites',
    });

    if (chrome.runtime.lastError) {
      console.log(
        'Content script - Extension context invalidated, skipping blocked sites check'
      );
      return false;
    }

    console.log('Content script - Blocked sites response:', response);

    if (!response || response.length === 0) {
      console.log('Content script - No blocked sites found');
      return false;
    }

    const currentUrl = window.location.href;
    const currentDomain = extractDomain(currentUrl);

    console.log('Content script - Current URL:', currentUrl);
    console.log('Content script - Current domain:', currentDomain);

    const isBlocked = response.some((site: any) => {
      const siteDomain = extractDomain(site.url);
      console.log(
        'Content script - Checking against site:',
        site.url,
        'domain:',
        siteDomain
      );

      // Remove www. prefix for comparison
      const normalizedCurrentDomain = currentDomain.replace(/^www\./, '');
      const normalizedSiteDomain = siteDomain.replace(/^www\./, '');

      console.log(
        'Content script - Normalized comparison:',
        normalizedCurrentDomain,
        'vs',
        normalizedSiteDomain
      );

      return (
        normalizedCurrentDomain === normalizedSiteDomain ||
        normalizedCurrentDomain.endsWith('.' + normalizedSiteDomain)
      );
    });

    if (isBlocked) {
      console.log(
        'Content script - Current site is blocked, checking for temporary unblock'
      );

      // Check if there's a temporary unblock for this site
      const tempUnblockResponse = await chrome.runtime.sendMessage({
        action: 'getTemporaryUnblocks',
      });

      if (chrome.runtime.lastError) {
        console.log(
          'Content script - Extension context invalidated, skipping temporary unblock check'
        );
        return false;
      }

      console.log(
        'Content script - Temporary unblocks response:',
        tempUnblockResponse
      );

      if (tempUnblockResponse && tempUnblockResponse.length > 0) {
        const now = Date.now();
        const hasTempUnblock = tempUnblockResponse.some((unblock: any) => {
          const unblockDomain = extractDomain(unblock.url);
          const normalizedUnblockDomain = unblockDomain.replace(/^www\./, '');
          const normalizedCurrentDomain = currentDomain.replace(/^www\./, '');

          console.log(
            'Content script - Checking temp unblock:',
            unblock.url,
            'domain:',
            normalizedUnblockDomain,
            'expires:',
            new Date(unblock.expiresAt).toLocaleString()
          );

          return (
            (normalizedCurrentDomain === normalizedUnblockDomain ||
              normalizedCurrentDomain.endsWith(
                '.' + normalizedUnblockDomain
              )) &&
            unblock.expiresAt > now
          );
        });

        if (hasTempUnblock) {
          console.log(
            'Content script - Site has temporary unblock, will load React app'
          );
          return true;
        } else {
          console.log(
            'Content script - Site is blocked but no temporary unblock, skipping React app'
          );
          return false;
        }
      } else {
        console.log(
          'Content script - Site is blocked but no temporary unblocks found, skipping React app'
        );
        return false;
      }
    } else {
      console.log(
        'Content script - Current site is not blocked, skipping React app'
      );
      return false;
    }
  } catch (error) {
    console.log('Content script - Error checking if site is blocked:', error);
    return false;
  }
}
