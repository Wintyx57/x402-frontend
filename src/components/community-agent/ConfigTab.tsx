import { useState, useEffect } from 'react';
import StatusIndicator from './StatusIndicator';

interface Props {
  adminFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
}

interface PlatformConfig {
  enabled?: boolean;
  autoPublish?: boolean;
  [key: string]: unknown;
}

interface Settings {
  platforms?: Record<string, PlatformConfig>;
  contentSettings?: Record<string, unknown>;
  scheduleSettings?: Record<string, unknown>;
  [key: string]: unknown;
}

export default function ConfigTab({ adminFetch }: Props) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, 'ok' | 'error' | 'testing'>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    adminFetch<Settings>('/settings')
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [adminFetch]);

  const togglePlatform = (platform: string, field: 'enabled' | 'autoPublish') => {
    if (!settings?.platforms) return;
    setSettings({
      ...settings,
      platforms: {
        ...settings.platforms,
        [platform]: {
          ...settings.platforms[platform],
          [field]: !settings.platforms[platform]?.[field],
        },
      },
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await adminFetch('/settings', { method: 'POST', body: JSON.stringify(settings) });
      setMessage({ type: 'success', text: 'Settings saved' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setSaving(false);
    }
  };

  const testPlatform = async (platform: string) => {
    setTestResults(prev => ({ ...prev, [platform]: 'testing' }));
    try {
      await adminFetch(`/settings/test/${platform}`);
      setTestResults(prev => ({ ...prev, [platform]: 'ok' }));
    } catch {
      setTestResults(prev => ({ ...prev, [platform]: 'error' }));
    }
  };

  if (loading) {
    return <div className="space-y-4 animate-fade-in">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl animate-shimmer" />)}</div>;
  }

  const platforms = settings?.platforms || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {message && (
        <div className={`glass-card rounded-lg p-3 text-sm ${
          message.type === 'success' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'
        }`}>{message.text}</div>
      )}

      {/* Platform Settings */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Platform Settings</h3>
        <div className="space-y-4">
          {Object.entries(platforms).map(([name, cfg]) => (
            <div key={name} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white capitalize">{name}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!cfg.enabled}
                      onChange={() => togglePlatform(name, 'enabled')}
                      className="accent-[#FF9900] w-4 h-4"
                    />
                    Enabled
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!cfg.autoPublish}
                      onChange={() => togglePlatform(name, 'autoPublish')}
                      className="accent-[#FF9900] w-4 h-4"
                    />
                    Auto-publish
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => testPlatform(name)}
                  disabled={testResults[name] === 'testing'}
                  className="text-xs px-3 py-1 rounded-md glass-card text-gray-300 hover:text-white hover:bg-white/10"
                >
                  {testResults[name] === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
                {testResults[name] === 'ok' && <StatusIndicator color="green" />}
                {testResults[name] === 'error' && <StatusIndicator color="red" />}
                {testResults[name] === 'ok' && <span className="text-xs text-emerald-400">OK</span>}
                {testResults[name] === 'error' && <span className="text-xs text-red-400">Failed</span>}
              </div>
            </div>
          ))}
          {Object.keys(platforms).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No platform configuration available</p>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="gradient-btn text-white text-sm px-6 py-2.5 rounded-lg disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
