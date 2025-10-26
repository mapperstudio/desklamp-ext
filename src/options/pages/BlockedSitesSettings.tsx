import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

export default function BlockedSitesSettings() {
  const [blockedSites, setBlockedSites] = useState([
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'youtube.com',
  ]);
  const [newSite, setNewSite] = useState('');
  const [strictMode, setStrictMode] = useState(false);

  const addSite = () => {
    if (newSite.trim() && !blockedSites.includes(newSite.trim())) {
      setBlockedSites([...blockedSites, newSite.trim()]);
      setNewSite('');
    }
  };

  const removeSite = (site: string) => {
    setBlockedSites(blockedSites.filter(s => s !== site));
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Blocked Sites
        </h2>
        <p className="text-slate-600">
          Manage websites that are blocked during focus sessions.
        </p>
      </div>

      <div className="space-y-8">
        {/* Strict Mode */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Strict Blocking Mode
              </h3>
              <p className="text-slate-600 text-sm">
                Block all websites except those explicitly allowed
              </p>
            </div>
            <Checkbox
              checked={strictMode}
              onCheckedChange={checked => setStrictMode(checked === true)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Add New Site */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Add Blocked Site
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newSite}
              onChange={e => setNewSite(e.target.value)}
              placeholder="Enter domain (e.g., facebook.com)"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={e => e.key === 'Enter' && addSite()}
            />
            <Button
              onClick={addSite}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>

        {/* Blocked Sites List */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Blocked Sites ({blockedSites.length})
          </h3>
          <div className="space-y-2">
            {blockedSites.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No sites blocked yet. Add some sites to get started.
              </p>
            ) : (
              blockedSites.map(site => (
                <div
                  key={site}
                  className="flex items-center justify-between bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg p-3"
                >
                  <span className="text-slate-800 font-medium">{site}</span>
                  <Button
                    onClick={() => removeSite(site)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))
            )}
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
