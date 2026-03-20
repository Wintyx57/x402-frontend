import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';

// ---- Constants ----
const PRICE_PRESETS = [0.001, 0.005, 0.01];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30',
  POST: 'bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30',
  PUT: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  DELETE: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
  PATCH: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  OPTIONS: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  HEAD: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

// ---- Types ----
interface EndpointPreview {
  path: string;
  method: string;
  name: string;
  description: string;
  category: string;
  alreadyRegistered: boolean;
  operationId?: string;
}

interface PreviewResponse {
  endpoints: EndpointPreview[];
  title?: string;
  version?: string;
  description?: string;
}

interface ImportResult {
  imported: Array<{ id: string; name: string; path: string; method: string }>;
  skipped: Array<{ name: string; reason: string }>;
}

// ---- StepIndicator ----
function StepIndicator({
  num,
  label,
  active,
  done,
  current,
}: {
  num: number;
  label: string;
  active: boolean;
  done?: boolean;
  current?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        aria-current={current ? 'step' : undefined}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border ${
          done
            ? 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/40'
            : active
            ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/50 shadow-[0_0_12px_rgba(255,153,0,0.2)]'
            : 'bg-white/5 text-gray-500 border-white/10'
        }`}
      >
        {done ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          num
        )}
      </div>
      <span
        className={`text-xs transition-colors duration-300 hidden sm:block ${
          done ? 'text-[#34D399]' : active ? 'text-[#FF9900]' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ---- MethodBadge ----
function MethodBadge({ method }: { method: string }) {
  const cls = METHOD_COLORS[method.toUpperCase()] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${cls}`}>
      {method.toUpperCase()}
    </span>
  );
}

// ---- TagBadge ----
function TagBadge({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20">
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:text-white transition-colors"
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

// ---- Main Component ----
export default function ImportOpenAPI() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const { t } = useTranslation();
  const p = ((t as unknown) as Record<string, Record<string, string>>).importOpenAPI || {};

  useSEO({
    title: p.title || 'Import OpenAPI Spec — x402 Bazaar',
    description:
      p.subtitle ||
      'Upload your OpenAPI/Swagger spec and list all endpoints as paid APIs in one click.',
  });

  // ---- Step state ----
  const [step, setStep] = useState(1);

  // ---- Step 1: Upload ----
  const [file, setFile] = useState<File | null>(null);
  const [specUrl, setSpecUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Step 2: Preview ----
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // ---- Step 3: Configure ----
  const [defaultPrice, setDefaultPrice] = useState(0.005);
  const [walletAddr, setWalletAddr] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // ---- Step 4: Sign & Import ----
  const [isSigning, setIsSigning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // ---- Step 5: Results ----
  const [results, setResults] = useState<ImportResult | null>(null);

  // ---- Handlers ----

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && /\.(json|ya?ml)$/i.test(dropped.name)) {
      setFile(dropped);
      setSpecUrl('');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setSpecUrl('');
    }
  };

  const handleParseSpec = async () => {
    if (!file && !specUrl.trim()) return;
    setIsParsing(true);
    setParseError('');
    try {
      let resp: Response;
      if (file) {
        const form = new FormData();
        form.append('file', file);
        resp = await fetch(`${API_URL}/api/import-openapi/preview`, {
          method: 'POST',
          body: form,
        });
      } else {
        resp = await fetch(`${API_URL}/api/import-openapi/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: specUrl.trim() }),
        });
      }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || p.parseError || 'Failed to parse spec');
      }
      const data: PreviewResponse = await resp.json();
      setPreview(data);
      // Auto-select all non-registered endpoints
      const autoSelected = new Set<number>();
      data.endpoints.forEach((ep, i) => {
        if (!ep.alreadyRegistered) autoSelected.add(i);
      });
      setSelected(autoSelected);
      // Pre-fill wallet from wagmi
      if (address) setWalletAddr(address);
      setStep(2);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : p.parseError || 'Failed to parse spec');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleSelect = (idx: number) => {
    const ep = preview?.endpoints[idx];
    if (ep?.alreadyRegistered) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!preview) return;
    const allSelectable = preview.endpoints
      .map((ep, i) => ({ ep, i }))
      .filter(({ ep }) => !ep.alreadyRegistered)
      .map(({ i }) => i);
    setSelected(new Set(allSelectable));
  };

  const handleDeselectAll = () => {
    setSelected(new Set());
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagsInput.trim().replace(/,$/, '');
      if (val && !tags.includes(val) && tags.length < 10) {
        setTags((prev) => [...prev, val]);
        setTagsInput('');
      }
    }
  };

  const handleTagsBlur = () => {
    const val = tagsInput.trim().replace(/,$/, '');
    if (val && !tags.includes(val) && tags.length < 10) {
      setTags((prev) => [...prev, val]);
      setTagsInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const selectedEndpoints = preview
    ? preview.endpoints.filter((_, i) => selected.has(i))
    : [];

  const handleSignAndImport = async () => {
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }
    if (selectedEndpoints.length === 0) return;

    setIsSigning(true);
    setImportError('');
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const message = `import-openapi:${address}:${timestamp}`;
      const signature = await signMessageAsync({ message });
      setIsSigning(false);
      setIsImporting(true);

      const resp = await fetch(`${API_URL}/api/import-openapi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoints: selectedEndpoints,
          defaultPrice,
          walletAddress: walletAddr || address,
          tags,
          signature,
          address,
          timestamp,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || p.importError || 'Import failed');
      }

      const data: ImportResult = await resp.json();
      setResults(data);
      setStep(5);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : p.importError || 'Import failed');
    } finally {
      setIsSigning(false);
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setSpecUrl('');
    setPreview(null);
    setSelected(new Set());
    setDefaultPrice(0.005);
    setTags([]);
    setTagsInput('');
    setResults(null);
    setImportError('');
    setParseError('');
  };

  // ---- Step labels ----
  const stepLabels = [
    p.stepUpload || 'Upload',
    p.stepPreview || 'Preview',
    p.stepConfigure || 'Configure',
    p.stepSign || 'Sign',
    p.stepResults || 'Done',
  ];

  const alreadyRegisteredCount = preview
    ? preview.endpoints.filter((ep) => ep.alreadyRegistered).length
    : 0;

  return (
    <main className="min-h-screen pb-20" aria-label={p.title || 'Import OpenAPI'}>
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">

        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-medium mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            OpenAPI Import
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {p.title || 'Import OpenAPI Spec'}
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
            {p.subtitle ||
              'Upload your OpenAPI/Swagger spec and list all endpoints as paid APIs in one click.'}
          </p>
        </header>

        {/* Step indicators */}
        <nav aria-label="Import progress" className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
          {stepLabels.map((label, i) => {
            const num = i + 1;
            return (
              <div key={num} className="flex items-center gap-2 sm:gap-4">
                <StepIndicator
                  num={num}
                  label={label}
                  active={step === num}
                  done={step > num}
                  current={step === num}
                />
                {i < stepLabels.length - 1 && (
                  <div
                    className={`h-px w-8 sm:w-12 transition-colors duration-300 ${
                      step > num ? 'bg-[#34D399]/40' : 'bg-white/10'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* ---- STEP 1: Upload ---- */}
        {step === 1 && (
          <section className="glass-card rounded-xl p-6 sm:p-8 animate-fade-in-up" aria-labelledby="step1-title">
            <h2 id="step1-title" className="text-lg font-semibold text-white mb-6">
              {p.stepUpload || 'Upload'}
            </h2>

            {/* Dropzone */}
            <div
              role="button"
              tabIndex={0}
              aria-label={p.dropzoneTitle || 'Drop your OpenAPI spec here'}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#FF9900] bg-[#FF9900]/5 scale-[1.01]'
                  : file
                  ? 'border-[#34D399]/50 bg-[#34D399]/5'
                  : 'border-white/15 hover:border-[#FF9900]/40 hover:bg-[#FF9900]/3'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml"
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Upload OpenAPI spec file"
              />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#34D399]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[#34D399] font-medium text-sm">{file.name}</p>
                  <p className="text-gray-500 text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FF9900]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-sm">
                    {isDragging
                      ? 'Drop it here!'
                      : (p.dropzoneTitle || 'Drop your OpenAPI spec here')}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {p.dropzoneSubtitle || 'JSON or YAML — OpenAPI 2.0, 3.0, or 3.1'}
                  </p>
                  <p className="text-[#FF9900] text-xs font-medium">
                    Click to browse
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-xs">{p.orUrl || 'Or paste a spec URL'}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* URL input */}
            <div>
              <label htmlFor="spec-url" className="sr-only">
                {p.orUrl || 'Spec URL'}
              </label>
              <input
                id="spec-url"
                type="url"
                value={specUrl}
                onChange={(e) => { setSpecUrl(e.target.value); setFile(null); }}
                placeholder={p.urlPlaceholder || 'https://api.example.com/openapi.json'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 focus:ring-1 focus:ring-[#FF9900]/20 transition-colors"
              />
            </div>

            {/* Error */}
            {parseError && (
              <p role="alert" className="mt-3 text-[#EF4444] text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {parseError}
              </p>
            )}

            {/* Parse button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={(!file && !specUrl.trim()) || isParsing}
                onClick={handleParseSpec}
                className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isParsing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {p.parsing || 'Parsing...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {p.parseSpec || 'Parse Spec'}
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* ---- STEP 2: Preview ---- */}
        {step === 2 && preview && (
          <section className="animate-fade-in-up" aria-labelledby="step2-title">
            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h2 id="step2-title" className="text-sm font-semibold text-white">
                  {preview.endpoints.length} {p.endpointsFound || 'endpoints found'}
                  {alreadyRegisteredCount > 0 && (
                    <span className="ml-2 text-gray-500">
                      ({alreadyRegisteredCount} {p.alreadyRegistered || 'already registered'})
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-[#FF9900] hover:text-[#FF9900]/80 transition-colors"
                >
                  {p.selectAll || 'Select All'}
                </button>
                <span className="text-gray-600 text-xs">·</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {p.deselectAll || 'Deselect All'}
                </button>
                <span className="text-[#FF9900] text-xs font-semibold ml-2">
                  {selected.size} selected
                </span>
              </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto" role="region" aria-label="Endpoints table" tabIndex={0}>
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/3">
                      <th className="w-10 p-3" scope="col" aria-label="Select">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="text-left p-3 text-gray-400 font-medium text-xs" scope="col">Path</th>
                      <th className="text-left p-3 text-gray-400 font-medium text-xs" scope="col">Method</th>
                      <th className="text-left p-3 text-gray-400 font-medium text-xs" scope="col">Name</th>
                      <th className="text-left p-3 text-gray-400 font-medium text-xs" scope="col">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.endpoints.map((ep, i) => {
                      const isSelected = selected.has(i);
                      const isDisabled = ep.alreadyRegistered;
                      return (
                        <tr
                          key={i}
                          onClick={() => toggleSelect(i)}
                          className={`border-b border-white/5 last:border-0 transition-colors duration-150 ${
                            isDisabled
                              ? 'opacity-40 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#FF9900]/5 cursor-pointer hover:bg-[#FF9900]/8'
                              : 'cursor-pointer hover:bg-white/3'
                          }`}
                          aria-selected={isSelected}
                          role="row"
                        >
                          <td className="p-3 text-center" role="cell">
                            {!isDisabled ? (
                              <div
                                className={`w-4 h-4 rounded border mx-auto flex items-center justify-center transition-all duration-150 ${
                                  isSelected
                                    ? 'bg-[#FF9900] border-[#FF9900]'
                                    : 'border-white/20 bg-white/5'
                                }`}
                                aria-hidden="true"
                              >
                                {isSelected && (
                                  <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-600 text-xs" title="Already registered">✓</span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-xs text-gray-300 max-w-[200px] truncate" role="cell" title={ep.path}>
                            {ep.path}
                          </td>
                          <td className="p-3" role="cell">
                            <MethodBadge method={ep.method} />
                          </td>
                          <td className="p-3 text-gray-300 text-xs max-w-[180px] truncate" role="cell" title={ep.name}>
                            {ep.name || ep.operationId || '—'}
                          </td>
                          <td className="p-3" role="cell">
                            <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-400 border border-white/10">
                              {ep.category}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {preview.endpoints.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">
                {p.noEndpoints || 'No importable endpoints found'}
              </p>
            )}

            <div className="mt-6 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-gray-400 text-sm border border-white/10 hover:border-white/20 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={() => {
                  if (address) setWalletAddr(address);
                  setStep(3);
                }}
                className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue ({selected.size} selected)
              </button>
            </div>
          </section>
        )}

        {/* ---- STEP 3: Configure ---- */}
        {step === 3 && (
          <section className="glass-card rounded-xl p-6 sm:p-8 animate-fade-in-up" aria-labelledby="step3-title">
            <h2 id="step3-title" className="text-lg font-semibold text-white mb-6">
              {p.stepConfigure || 'Configure'}
            </h2>

            <div className="space-y-6">
              {/* Default price */}
              <fieldset>
                <legend className="block text-xs font-medium text-gray-400 mb-2">
                  {p.defaultPrice || 'Default Price (USDC)'}
                </legend>
                <div className="flex items-center gap-3 flex-wrap">
                  {PRICE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDefaultPrice(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-150 ${
                        defaultPrice === preset
                          ? 'bg-[#FF9900]/15 border-[#FF9900]/50 text-[#FF9900]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      ${preset} USDC
                    </button>
                  ))}
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-gray-500 text-xs">$</span>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      max="1000"
                      value={defaultPrice}
                      onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0.005)}
                      className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF9900]/50 transition-colors font-mono"
                      aria-label={p.defaultPrice || 'Default price in USDC'}
                    />
                    <span className="text-gray-500 text-xs">{p.perCallPrice || 'per call'}</span>
                  </div>
                </div>
              </fieldset>

              {/* Wallet address */}
              <div>
                <label htmlFor="wallet-addr" className="block text-xs font-medium text-gray-400 mb-2">
                  {p.walletAddress || 'Wallet Address'}
                </label>
                {isConnected && address ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-[#34D399] shrink-0" aria-hidden="true" />
                    <span className="text-gray-300 text-xs font-mono truncate">{address}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      id="wallet-addr"
                      type="text"
                      value={walletAddr}
                      onChange={(e) => setWalletAddr(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 transition-colors font-mono"
                    />
                    <p className="text-yellow-500/80 text-xs flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {p.connectWalletFirst || 'Connect your wallet to import APIs'}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags-input" className="block text-xs font-medium text-gray-400 mb-2">
                  {p.defaultTags || 'Default Tags'}
                </label>
                <input
                  id="tags-input"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  onBlur={handleTagsBlur}
                  placeholder={p.tagsPlaceholder || 'weather, data, api'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2" role="list" aria-label="Selected tags">
                    {tags.map((tag) => (
                      <div key={tag} role="listitem">
                        <TagBadge tag={tag} onRemove={() => handleRemoveTag(tag)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl text-gray-400 text-sm border border-white/10 hover:border-white/20 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* ---- STEP 4: Confirm & Sign ---- */}
        {step === 4 && (
          <section className="glass-card rounded-xl p-6 sm:p-8 animate-fade-in-up" aria-labelledby="step4-title">
            <h2 id="step4-title" className="text-lg font-semibold text-white mb-6">
              {p.importSummary || 'Import Summary'}
            </h2>

            {/* Summary card */}
            <div className="bg-white/3 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">
                  {p.endpointsToImport || 'Endpoints to import'}
                </span>
                <span className="text-white font-semibold text-sm">
                  {selectedEndpoints.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">
                  {p.walletAddress || 'Wallet Address'}
                </span>
                <span className="text-gray-300 text-xs font-mono truncate max-w-[200px]">
                  {isConnected && address ? address : walletAddr || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">
                  {p.priceRange || 'Price range'}
                </span>
                <span className="text-[#FF9900] font-mono text-xs">
                  ${defaultPrice} USDC
                </span>
              </div>
              {tags.length > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-400 text-xs shrink-0">Tags</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {tags.map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Endpoint preview list (first 5) */}
            {selectedEndpoints.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">Endpoints to import:</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedEndpoints.slice(0, 10).map((ep, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <MethodBadge method={ep.method} />
                      <span className="text-gray-300 font-mono truncate">{ep.path}</span>
                    </div>
                  ))}
                  {selectedEndpoints.length > 10 && (
                    <p className="text-gray-500 text-xs">
                      +{selectedEndpoints.length - 10} more...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {importError && (
              <p role="alert" className="mb-4 text-[#EF4444] text-xs flex items-center gap-2 p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {importError}
              </p>
            )}

            {/* Connect wallet hint */}
            {!isConnected && (
              <div className="mb-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-500/80 text-xs flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {p.connectWalletFirst || 'Connect your wallet to import APIs'}
                </p>
              </div>
            )}

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={isSigning || isImporting}
                className="px-4 py-2.5 rounded-xl text-gray-400 text-sm border border-white/10 hover:border-white/20 hover:text-white transition-colors disabled:opacity-40"
              >
                Back
              </button>

              {isConnected ? (
                <button
                  type="button"
                  disabled={isSigning || isImporting || selectedEndpoints.length === 0}
                  onClick={handleSignAndImport}
                  className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSigning ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {p.signing || 'Signing...'}
                    </>
                  ) : isImporting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {p.importing || 'Importing...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                      </svg>
                      {p.signAndImport || 'Sign & Import'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openConnectModal?.()}
                  className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Connect Wallet
                </button>
              )}
            </div>
          </section>
        )}

        {/* ---- STEP 5: Results ---- */}
        {step === 5 && results && (
          <section className="animate-fade-in-up" aria-labelledby="step5-title">
            {/* Success header */}
            <div className="glass-card rounded-xl p-6 mb-6 border border-[#34D399]/20 shadow-[0_0_30px_rgba(52,211,153,0.08)]">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#34D399]/10 border border-[#34D399]/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 id="step5-title" className="text-xl font-bold text-white">
                  {p.importSuccess || 'Import Successful!'}
                </h2>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#34D399]">{results.imported.length}</p>
                    <p className="text-gray-500 text-xs">{p.imported || 'imported'}</p>
                  </div>
                  {results.skipped.length > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-400">{results.skipped.length}</p>
                      <p className="text-gray-500 text-xs">{p.skipped || 'skipped'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Imported services list */}
            {results.imported.length > 0 && (
              <div className="glass-card rounded-xl overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-white/5 bg-white/3">
                  <h3 className="text-xs font-semibold text-gray-300">
                    {p.imported || 'Imported'} APIs
                  </h3>
                </div>
                <ul className="divide-y divide-white/5">
                  {results.imported.map((svc) => (
                    <li key={svc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                      <MethodBadge method={svc.method} />
                      <span className="text-gray-300 text-xs font-mono flex-1 truncate">{svc.name || svc.path}</span>
                      <Link
                        to={`/services/${svc.id}`}
                        className="text-[#FF9900] text-xs hover:text-[#FF9900]/80 transition-colors shrink-0 no-underline"
                        aria-label={`View ${svc.name}`}
                      >
                        View →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skipped reasons */}
            {results.skipped.length > 0 && (
              <div className="glass-card rounded-xl overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-white/5 bg-white/3">
                  <h3 className="text-xs font-semibold text-gray-400">
                    {p.skipped || 'Skipped'} ({results.skipped.length})
                  </h3>
                </div>
                <ul className="divide-y divide-white/5">
                  {results.skipped.map((sk, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-3 opacity-60">
                      <span className="text-gray-400 text-xs flex-1 truncate">{sk.name}</span>
                      <span className="text-gray-600 text-xs shrink-0">{sk.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl text-gray-300 text-sm border border-white/15 hover:border-white/25 hover:text-white transition-colors font-medium"
              >
                {p.importAnother || 'Import Another'}
              </button>
              <Link
                to="/my-apis"
                className="gradient-btn px-5 py-2.5 rounded-xl text-white text-sm font-medium text-center no-underline transition-opacity hover:opacity-90"
              >
                {p.viewMyApis || 'View My APIs'} →
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
