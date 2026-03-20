import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';
import CredentialsSection, {
  buildCredentialsPayload,
  type CredentialType,
  type CredentialItem,
} from '../components/CredentialsSection';

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

// ---- Types (matching backend snake_case responses) ----
interface EndpointPreview {
  path: string;
  method: string;
  name: string;
  description: string;
  tags: string[];
  category: string;
  parameters: { required: string[]; properties: Record<string, unknown> };
  full_url: string;
  already_registered: boolean;
}

interface PreviewResponse {
  spec_title: string;
  spec_version: string;
  base_url: string;
  endpoints: EndpointPreview[];
  total: number;
  already_registered_count: number;
}

interface ImportResponse {
  success: boolean;
  spec_title: string;
  total_found: number;
  imported: number;
  skipped: number;
  skipped_details: Array<{ path: string; method: string; reason: string }>;
  services: Array<{ id: string; name: string; url: string; price_usdc: number }>;
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

// ---- Spinner ----
function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
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
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // ---- Step 3: Credentials (apply to all imported endpoints) ----
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentialType, setCredentialType] = useState<CredentialType>('bearer');
  const [credentialItems, setCredentialItems] = useState<CredentialItem[]>([{ key: '', value: '' }]);

  // ---- Step 4: Sign & Import ----
  const [isSigning, setIsSigning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // ---- Step 5: Results ----
  const [results, setResults] = useState<ImportResponse | null>(null);

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

  // BUG FIX 1 & 2: correct field names for preview endpoint
  const handleParseSpec = async () => {
    if (!file && !specUrl.trim()) return;
    setIsParsing(true);
    setParseError('');
    try {
      let resp: Response;
      if (file) {
        const form = new FormData();
        // BUG FIX 2: field name must be 'specFile', not 'file'
        form.append('specFile', file);
        resp = await fetch(`${API_URL}/api/import-openapi/preview`, {
          method: 'POST',
          body: form,
        });
      } else {
        resp = await fetch(`${API_URL}/api/import-openapi/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // BUG FIX 1: field must be 'specUrl', not 'url'
          body: JSON.stringify({ specUrl: specUrl.trim() }),
        });
      }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || p.parseError || 'Failed to parse spec');
      }
      // BUG FIX 4: backend returns snake_case — PreviewResponse now matches backend shape
      const data: PreviewResponse = await resp.json();
      setPreview(data);
      // Auto-select all non-registered endpoints using correct snake_case field
      const autoSelected = new Set<number>();
      data.endpoints.forEach((ep, i) => {
        if (!ep.already_registered) autoSelected.add(i);
      });
      setSelected(autoSelected);
      setStep(2);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : p.parseError || 'Failed to parse spec');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleSelect = (idx: number) => {
    const ep = preview?.endpoints[idx];
    // BUG FIX 4: use snake_case field
    if (ep?.already_registered) return;
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
      .filter(({ ep }) => !ep.already_registered)
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

  // BUG FIX 3 & 5: correct payload shape + timestamp in milliseconds
  const handleSignAndImport = async () => {
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }
    if (selectedEndpoints.length === 0) return;

    setIsSigning(true);
    setImportError('');
    try {
      // BUG FIX 5: timestamp in MILLISECONDS (Date.now()), not seconds
      const timestamp = Date.now();
      const message = `import-openapi:${address}:${timestamp}`;
      const signature = await signMessageAsync({ message });
      setIsSigning(false);
      setIsImporting(true);

      // Build excludePaths from deselected non-registered endpoints
      const excludePaths = preview!.endpoints
        .filter((ep, i) => !selected.has(i) && !ep.already_registered)
        .map((ep) => ep.path);

      const importCredentials = buildCredentialsPayload(credentialType, credentialItems);

      let resp: Response;
      if (file) {
        // BUG FIX 3: re-upload the file and send correct fields for import endpoint
        const form = new FormData();
        form.append('specFile', file);
        form.append('ownerAddress', address);
        form.append('defaultPrice', String(defaultPrice));
        form.append('signature', signature);
        form.append('timestamp', String(timestamp));
        if (excludePaths.length > 0) {
          form.append('excludePaths', JSON.stringify(excludePaths));
        }
        if (tags.length > 0) {
          form.append('defaultTags', JSON.stringify(tags));
        }
        if (importCredentials) {
          form.append('credentials', JSON.stringify(importCredentials));
        }
        resp = await fetch(`${API_URL}/api/import-openapi`, { method: 'POST', body: form });
      } else {
        // BUG FIX 3: backend re-parses the spec — send specUrl + correct field names
        resp = await fetch(`${API_URL}/api/import-openapi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            specUrl: specUrl.trim(),
            ownerAddress: address,
            defaultPrice,
            signature,
            timestamp,
            excludePaths: excludePaths.length > 0 ? excludePaths : undefined,
            defaultTags: tags.length > 0 ? tags : undefined,
            ...(importCredentials ? { credentials: importCredentials } : {}),
          }),
        });
      }

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || p.importError || 'Import failed');
      }

      const data: ImportResponse = await resp.json();
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
    setShowCredentials(false);
    setCredentialType('bearer');
    setCredentialItems([{ key: '', value: '' }]);
  };

  // ---- Step labels ----
  const stepLabels = [
    p.stepUpload || 'Upload',
    p.stepPreview || 'Preview',
    p.stepConfigure || 'Configure',
    p.stepSign || 'Sign',
    p.stepResults || 'Done',
  ];

  const alreadyRegisteredCount = preview ? preview.already_registered_count : 0;

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
          <div className="mt-4">
            <Link
              to="/register"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors no-underline"
            >
              ← Back to Register
            </Link>
          </div>
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
              {p.stepUpload || 'Upload Your Spec'}
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
                  <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
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
                  <p className="text-[#FF9900] text-xs font-medium">Click to browse</p>
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
              <p role="alert" className="mt-3 text-[#EF4444] text-xs flex items-center gap-2 p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg">
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
                    <Spinner />
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
            {/* Spec info bar */}
            {(preview.spec_title || preview.base_url) && (
              <div className="glass-card rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center gap-3 text-xs">
                {preview.spec_title && (
                  <span className="text-white font-semibold">{preview.spec_title}</span>
                )}
                {preview.spec_version && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400 font-mono">
                    v{preview.spec_version}
                  </span>
                )}
                {preview.base_url && (
                  <span className="text-gray-500 font-mono truncate max-w-xs">{preview.base_url}</span>
                )}
              </div>
            )}

            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h2 id="step2-title" className="text-sm font-semibold text-white">
                  {preview.total} {p.endpointsFound || 'endpoints found'}
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
                      <th className="w-10 p-3" scope="col">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="text-left p-3 text-gray-400 font-medium text-xs" scope="col">Method</th>
                      <th className="text-left p-3 text-gray-400 font-medium text-xs" scope="col">Path</th>
                      <th className="text-left p-3 text-gray-400 font-medium text-xs" scope="col">Name</th>
                      <th className="text-left p-3 text-gray-400 font-medium text-xs hidden md:table-cell" scope="col">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.endpoints.map((ep, i) => {
                      const isSelected = selected.has(i);
                      // BUG FIX 4: use snake_case field
                      const isDisabled = ep.already_registered;
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
                              <span className="text-[#34D399] text-xs" title="Already registered" aria-label="Already registered">
                                <svg className="w-3.5 h-3.5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            )}
                          </td>
                          <td className="p-3" role="cell">
                            <MethodBadge method={ep.method} />
                          </td>
                          <td className="p-3 font-mono text-xs text-gray-300 max-w-[200px] truncate" role="cell" title={ep.path}>
                            {ep.path}
                          </td>
                          <td className="p-3 text-gray-300 text-xs max-w-[180px] truncate" role="cell" title={ep.name}>
                            {ep.name || '—'}
                          </td>
                          <td className="p-3 hidden md:table-cell" role="cell">
                            <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-400 border border-white/10">
                              {ep.category || 'other'}
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
                onClick={() => setStep(3)}
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
                  {p.defaultPrice || 'Default Price (USDC per call)'}
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
                <p className="block text-xs font-medium text-gray-400 mb-2">
                  {p.walletAddress || 'Payment Wallet'}
                </p>
                {isConnected && address ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-[#34D399] shrink-0" aria-hidden="true" />
                    <span className="text-gray-300 text-xs font-mono truncate">{address}</span>
                    <span className="ml-auto text-[#34D399] text-xs">Connected</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => openConnectModal?.()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF9900]/5 border border-[#FF9900]/20 rounded-xl text-[#FF9900] text-sm font-medium hover:bg-[#FF9900]/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {p.connectWalletFirst || 'Connect Wallet to Continue'}
                    </button>
                    <p className="text-yellow-500/70 text-xs text-center">
                      A wallet signature is required to authenticate the import
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags-input" className="block text-xs font-medium text-gray-400 mb-2">
                  {p.defaultTags || 'Default Tags'}{' '}
                  <span className="text-gray-600 font-normal">(optional, applied to all imported APIs)</span>
                </label>
                <input
                  id="tags-input"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  onBlur={handleTagsBlur}
                  placeholder={p.tagsPlaceholder || 'e.g. weather, data, api — press Enter to add'}
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

              {/* API Authentication — applied to all imported endpoints */}
              <CredentialsSection
                showCredentials={showCredentials}
                onToggle={() => setShowCredentials((v) => !v)}
                credentialType={credentialType}
                onTypeChange={setCredentialType}
                credentialItems={credentialItems}
                onItemsChange={setCredentialItems}
              />
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
                disabled={!isConnected}
                className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
              {p.importSummary || 'Review & Sign'}
            </h2>

            {/* Summary card */}
            <div className="bg-white/3 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
              {preview?.spec_title && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Spec</span>
                  <span className="text-white text-xs font-medium">{preview.spec_title}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">
                  {p.endpointsToImport || 'Endpoints to import'}
                </span>
                <span className="text-white font-semibold text-sm">{selectedEndpoints.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">{p.walletAddress || 'Owner wallet'}</span>
                <span className="text-gray-300 text-xs font-mono truncate max-w-[200px]">
                  {address || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">{p.priceRange || 'Price per call'}</span>
                <span className="text-[#FF9900] font-mono text-xs font-semibold">
                  ${defaultPrice} USDC
                </span>
              </div>
              {tags.length > 0 && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-400 text-xs shrink-0 pt-0.5">Tags</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {tags.map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Endpoint preview list (first 10) */}
            {selectedEndpoints.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">
                  Endpoints to import
                  {selectedEndpoints.length > 10 && ` (showing 10 of ${selectedEndpoints.length})`}:
                </p>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 rounded-lg">
                  {selectedEndpoints.slice(0, 10).map((ep, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg bg-white/3">
                      <MethodBadge method={ep.method} />
                      <span className="text-gray-300 font-mono truncate flex-1">{ep.path}</span>
                      {ep.name && (
                        <span className="text-gray-500 truncate max-w-[120px] hidden sm:block">{ep.name}</span>
                      )}
                    </div>
                  ))}
                  {selectedEndpoints.length > 10 && (
                    <p className="text-gray-500 text-xs text-center py-1">
                      +{selectedEndpoints.length - 10} more endpoints
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Signature info */}
            <div className="mb-5 p-3 bg-[#FF9900]/5 border border-[#FF9900]/15 rounded-lg flex gap-2.5">
              <svg className="w-4 h-4 text-[#FF9900] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#FF9900]/80 text-xs leading-relaxed">
                Your wallet will sign a message to authenticate this import. No gas fees are required — this is a free off-chain signature.
              </p>
            </div>

            {/* Error */}
            {importError && (
              <p role="alert" className="mb-4 text-[#EF4444] text-xs flex items-center gap-2 p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {importError}
              </p>
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

              <button
                type="button"
                disabled={isSigning || isImporting || selectedEndpoints.length === 0 || !isConnected}
                onClick={handleSignAndImport}
                className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSigning ? (
                  <>
                    <Spinner />
                    {p.signing || 'Signing...'}
                  </>
                ) : isImporting ? (
                  <>
                    <Spinner />
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
                <div>
                  <h2 id="step5-title" className="text-xl font-bold text-white mb-1">
                    {p.importSuccess || 'Import Successful!'}
                  </h2>
                  {results.spec_title && (
                    <p className="text-gray-400 text-sm">{results.spec_title}</p>
                  )}
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#34D399]">{results.imported}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{p.imported || 'imported'}</p>
                  </div>
                  {results.skipped > 0 && (
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-400">{results.skipped}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{p.skipped || 'skipped'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Imported services list — BUG FIX 4: use snake_case from ImportResponse */}
            {results.services && results.services.length > 0 && (
              <div className="glass-card rounded-xl overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-white/5 bg-white/3">
                  <h3 className="text-xs font-semibold text-gray-300">
                    {p.imported || 'Imported'} APIs ({results.services.length})
                  </h3>
                </div>
                <ul className="divide-y divide-white/5">
                  {results.services.map((svc) => (
                    <li key={svc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                      <span className="text-gray-300 text-xs font-mono flex-1 truncate">{svc.name || svc.url}</span>
                      <span className="text-[#FF9900] font-mono text-xs shrink-0">${svc.price_usdc}</span>
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

            {/* Skipped reasons — BUG FIX 4: skipped_details is array of {path, method, reason} */}
            {results.skipped_details && results.skipped_details.length > 0 && (
              <div className="glass-card rounded-xl overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-white/5 bg-white/3">
                  <h3 className="text-xs font-semibold text-gray-400">
                    {p.skipped || 'Skipped'} ({results.skipped_details.length})
                  </h3>
                </div>
                <ul className="divide-y divide-white/5">
                  {results.skipped_details.map((sk, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-3 opacity-60">
                      <MethodBadge method={sk.method} />
                      <span className="text-gray-400 text-xs font-mono flex-1 truncate">{sk.path}</span>
                      <span className="text-gray-600 text-xs shrink-0 max-w-[150px] truncate" title={sk.reason}>{sk.reason}</span>
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
