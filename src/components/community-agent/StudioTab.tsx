import { useState } from 'react';

interface Props {
  adminFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
}

const STRATEGIES = ['daily-stats', 'weekly-recap', 'new-api'];
const PLATFORMS = ['telegram', 'discord', 'twitter', 'reddit', 'devto', 'linkedin', 'farcaster'];

export default function StudioTab({ adminFetch }: Props) {
  const [strategy, setStrategy] = useState(STRATEGIES[0]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['telegram', 'discord']);
  const [preview, setPreview] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const generatePreview = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await adminFetch<{ contents?: Record<string, string>; content?: string }>('/preview', {
        method: 'POST',
        body: JSON.stringify({ strategy, platforms: selectedPlatforms }),
      });
      setPreview(data.contents || (data.content ? { preview: data.content } : null));
    } catch (err: any) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    setResult(null);
    try {
      const data = await adminFetch<{ results?: Record<string, { success?: boolean }> }>('/publish', {
        method: 'POST',
        body: JSON.stringify({ strategy, targetPlatforms: selectedPlatforms, contents: preview }),
      });
      const successes = data.results ? Object.values(data.results).filter(r => r.success).length : 0;
      setResult({ type: 'success', message: `Published to ${successes} platform(s)` });
      setPreview(null);
    } catch (err: any) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {result && (
        <div className={`glass-card rounded-lg p-3 text-sm ${
          result.type === 'success' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'
        }`}>{result.message}</div>
      )}

      {/* Strategy */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Strategy</h3>
        <div className="flex gap-2">
          {STRATEGIES.map(s => (
            <button
              key={s}
              onClick={() => { setStrategy(s); setPreview(null); }}
              className={`text-sm px-4 py-2 rounded-lg ${
                strategy === s ? 'bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/30' : 'glass-card text-gray-400 hover:text-white'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Platform Selection */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Platforms</h3>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              className={`text-sm px-3 py-1.5 rounded-lg capitalize ${
                selectedPlatforms.includes(p)
                  ? 'bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/30'
                  : 'glass-card text-gray-400 hover:text-white'
              }`}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Preview</h3>
          <button
            onClick={generatePreview}
            disabled={loading || selectedPlatforms.length === 0}
            className="gradient-btn text-white text-sm px-4 py-2 rounded-lg disabled:opacity-40"
          >
            {loading ? 'Generating...' : 'Generate Preview'}
          </button>
        </div>
        {preview ? (
          <div className="space-y-4">
            {Object.entries(preview).map(([platform, content]) => (
              <div key={platform} className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-[#FF9900] font-semibold uppercase mb-2">{platform}</div>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{content}</pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            Select platforms and click "Generate Preview"
          </div>
        )}
      </div>

      {/* Actions */}
      {preview && (
        <div className="flex gap-3">
          <button
            onClick={publish}
            disabled={publishing}
            className="gradient-btn text-white text-sm px-6 py-2.5 rounded-lg disabled:opacity-40"
          >
            {publishing ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      )}
    </div>
  );
}
