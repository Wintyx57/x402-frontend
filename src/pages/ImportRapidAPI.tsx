import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAccount, useSignMessage } from "wagmi";
import { useConnectModal } from "thirdweb/react";
import { thirdwebClient, wallets } from "../lib/thirdweb";
import { useTranslation } from "../i18n/LanguageContext";
import useSEO from "../hooks/useSEO";
import { API_URL } from "../config";

// ---- Constants ----
const METHOD_COLORS: Record<string, string> = {
  GET: "bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30",
  POST: "bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30",
  PUT: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  DELETE: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
  PATCH: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  OPTIONS: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  HEAD: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

// ---- Types ----
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
  rapidapi?: {
    detected: boolean;
    host?: string;
  };
}

interface ImportResponse {
  success: boolean;
  spec_title: string;
  total_found: number;
  imported: number;
  skipped: number;
  skipped_details: Array<{ path: string; method: string; reason: string }>;
  services: Array<{
    id: string;
    name: string;
    url: string;
    price_usdc: number;
  }>;
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
        aria-current={current ? "step" : undefined}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border ${
          done
            ? "bg-[#34D399]/15 text-[#34D399] border-[#34D399]/40"
            : active
              ? "bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/50 shadow-[0_0_12px_rgba(255,153,0,0.2)]"
              : "bg-white/5 text-gray-500 border-white/10"
        }`}
      >
        {done ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          num
        )}
      </div>
      <span
        className={`text-xs transition-colors duration-300 hidden sm:block ${
          done ? "text-[#34D399]" : active ? "text-[#FF9900]" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ---- MethodBadge ----
function MethodBadge({ method }: { method: string }) {
  const cls =
    METHOD_COLORS[method.toUpperCase()] ||
    "bg-gray-500/15 text-gray-400 border-gray-500/30";
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${cls}`}
    >
      {method.toUpperCase()}
    </span>
  );
}

// ---- Spinner ----
function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ---- Main Component ----
export default function ImportRapidAPI() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connect } = useConnectModal();
  const { t } = useTranslation();
  const p =
    (t as unknown as Record<string, Record<string, string>>).importRapidapi ||
    {};

  useSEO({
    title: p.title || "Import from RapidAPI — x402 Bazaar",
    description:
      p.subtitle ||
      "Import any RapidAPI API in seconds. Credentials auto-configured.",
  });

  // ---- Step state ----
  const [step, setStep] = useState(1);

  // ---- Step 1: Upload & Key ----
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rapidapiKey, setRapidapiKey] = useState("");
  const [rapidapiHost, setRapidapiHost] = useState("");
  const [rapidapiDetected, setRapidapiDetected] = useState(false);

  // ---- Step 2: Preview ----
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [defaultPrice, setDefaultPrice] = useState(0.01);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // ---- Step 3: Sign & Import ----
  const [isSigning, setIsSigning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
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
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleParseSpec = async () => {
    if (!file) return;
    setIsParsing(true);
    setParseError("");
    try {
      const form = new FormData();
      form.append("specFile", file);
      const resp = await fetch(`${API_URL}/api/import-openapi/preview`, {
        method: "POST",
        body: form,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error || "Failed to parse spec",
        );
      }
      const data: PreviewResponse = await resp.json();
      setPreview(data);

      // Check RapidAPI detection
      if (data.rapidapi?.detected) {
        setRapidapiDetected(true);
        if (data.rapidapi.host) setRapidapiHost(data.rapidapi.host);
      } else {
        setRapidapiDetected(false);
      }

      // Auto-select all non-registered endpoints
      const autoSelected = new Set<number>();
      data.endpoints.forEach((ep, i) => {
        if (!ep.already_registered) autoSelected.add(i);
      });
      setSelected(autoSelected);
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Failed to parse spec",
      );
    } finally {
      setIsParsing(false);
    }
  };

  const toggleSelect = (idx: number) => {
    const ep = preview?.endpoints[idx];
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
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagsInput.trim().replace(/,$/, "");
      if (val && !tags.includes(val) && tags.length < 10) {
        setTags((prev) => [...prev, val]);
        setTagsInput("");
      }
    }
  };

  const handleTagsBlur = () => {
    const val = tagsInput.trim().replace(/,$/, "");
    if (val && !tags.includes(val) && tags.length < 10) {
      setTags((prev) => [...prev, val]);
      setTagsInput("");
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
      connect({ client: thirdwebClient, wallets });
      return;
    }
    if (selectedEndpoints.length === 0 || !rapidapiKey.trim()) return;

    setIsSigning(true);
    setImportError("");
    try {
      const timestamp = Date.now();
      const message = `import-openapi:${address}:${timestamp}`;
      const signature = await signMessageAsync({ message });
      setIsSigning(false);
      setIsImporting(true);

      // Build excludePaths from deselected non-registered endpoints
      const excludePaths = preview!.endpoints
        .filter((ep, i) => !selected.has(i) && !ep.already_registered)
        .map((ep) => ep.path);

      // Build credentials JSON for RapidAPI (header type with key + host)
      const credentialsPayload = JSON.stringify({
        type: "header",
        credentials: [
          { key: "X-RapidAPI-Key", value: rapidapiKey.trim() },
          { key: "X-RapidAPI-Host", value: rapidapiHost },
        ],
      });

      const form = new FormData();
      form.append("specFile", file!);
      form.append("ownerAddress", address);
      form.append("defaultPrice", String(defaultPrice));
      form.append("signature", signature);
      form.append("timestamp", String(timestamp));
      form.append("credentials", credentialsPayload);
      if (excludePaths.length > 0) {
        form.append("excludePaths", JSON.stringify(excludePaths));
      }
      if (tags.length > 0) {
        form.append("defaultTags", JSON.stringify(tags));
      }

      const resp = await fetch(`${API_URL}/api/import-openapi`, {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error || p.importing || "Import failed",
        );
      }

      const data: ImportResponse = await resp.json();
      setResults(data);
      setStep(4); // success
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsSigning(false);
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setPreview(null);
    setSelected(new Set());
    setDefaultPrice(0.01);
    setTags([]);
    setTagsInput("");
    setResults(null);
    setImportError("");
    setParseError("");
    setRapidapiKey("");
    setRapidapiHost("");
    setRapidapiDetected(false);
  };

  // ---- Step labels ----
  const stepLabels = [
    p.step1 || "Upload & Key",
    p.step2 || "Preview",
    p.step3 || "Import",
  ];

  const alreadyRegisteredCount = preview ? preview.already_registered_count : 0;

  // Can proceed from step 1?
  const canProceedStep1 = file && preview && rapidapiKey.trim().length > 0;

  return (
    <main
      className="min-h-screen pb-20"
      aria-label={p.title || "Import from RapidAPI"}
    >
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#60A5FA]/10 border border-[#60A5FA]/20 text-[#60A5FA] text-xs font-medium mb-4">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            RapidAPI Import
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {p.title || "Import from RapidAPI"}
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
            {p.subtitle ||
              "Import any RapidAPI API in seconds. Credentials auto-configured."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link
              to="/import"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors no-underline"
            >
              &larr; {p.backToImport || "Standard Import"}
            </Link>
            <Link
              to="/register"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors no-underline"
            >
              &larr; {p.backToRegister || "Register"}
            </Link>
          </div>
        </header>

        {/* Step indicators */}
        <nav
          aria-label="Import progress"
          className="flex items-center justify-center gap-2 sm:gap-4 mb-10"
        >
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
                      step > num ? "bg-[#34D399]/40" : "bg-white/10"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* ---- STEP 1: Upload & Key ---- */}
        {step === 1 && (
          <section
            className="glass-card rounded-xl p-6 sm:p-8 animate-fade-in-up space-y-6"
            aria-labelledby="step1-title"
          >
            <h2 id="step1-title" className="text-lg font-semibold text-white">
              {p.step1 || "Upload & Key"}
            </h2>

            {/* Hint */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#60A5FA]/5 border border-[#60A5FA]/20">
              <svg
                className="w-4 h-4 text-[#60A5FA] mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-[#60A5FA]/80 leading-relaxed">
                {p.uploadHint ||
                  "Download your API spec from RapidAPI: API Dashboard > Definitions > Download API Spec"}
              </p>
            </div>

            {/* Dropzone */}
            <div
              role="button"
              tabIndex={0}
              aria-label={p.uploadSpec || "Upload your OpenAPI spec"}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) =>
                e.key === "Enter" && fileInputRef.current?.click()
              }
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-[#60A5FA] bg-[#60A5FA]/5 scale-[1.01]"
                  : file
                    ? "border-[#34D399]/50 bg-[#34D399]/5"
                    : "border-white/15 hover:border-[#60A5FA]/40 hover:bg-[#60A5FA]/3"
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
                    <svg
                      className="w-6 h-6 text-[#34D399]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-[#34D399] font-medium text-sm">
                    {file.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      setRapidapiDetected(false);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#60A5FA]/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#60A5FA]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-white font-medium text-sm">
                    {isDragging
                      ? "Drop it here!"
                      : p.uploadSpec || "Upload your OpenAPI spec"}
                  </p>
                  <p className="text-gray-500 text-xs">JSON or YAML</p>
                  <p className="text-[#60A5FA] text-xs font-medium">
                    Click to browse
                  </p>
                </div>
              )}
            </div>

            {/* Parse button (after file selected, before preview) */}
            {file && !preview && (
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isParsing}
                  onClick={handleParseSpec}
                  className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isParsing ? (
                    <>
                      <Spinner />
                      {p.parsing || "Parsing..."}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {p.parseSpec || "Parse Spec"}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Parse error */}
            {parseError && (
              <p
                role="alert"
                className="text-[#EF4444] text-xs flex items-center gap-2 p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {parseError}
              </p>
            )}

            {/* Preview info (after parse) */}
            {preview && (
              <div className="space-y-4">
                {/* Spec info */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {preview.spec_title && (
                    <span className="text-white font-semibold">
                      {preview.spec_title}
                    </span>
                  )}
                  {preview.spec_version && (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400 font-mono">
                      v{preview.spec_version}
                    </span>
                  )}
                  <span className="text-gray-400">
                    {preview.total} {p.endpoints || "endpoints found"}
                  </span>
                </div>

                {/* RapidAPI detection badge */}
                {rapidapiDetected ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#34D399]/5 border border-[#34D399]/20">
                    <svg
                      className="w-4 h-4 text-[#34D399] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-[#34D399] text-xs font-medium">
                      {p.detected || "RapidAPI Detected"} — {p.host || "Host"}:{" "}
                      {rapidapiHost}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <svg
                      className="w-4 h-4 text-yellow-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-yellow-400 text-xs">
                      {p.notDetected ||
                        "This spec doesn't look like a RapidAPI spec."}{" "}
                      <Link
                        to="/import"
                        className="underline hover:text-yellow-300 transition-colors"
                      >
                        {p.standardImport || "Try standard import"}
                      </Link>
                    </span>
                  </div>
                )}

                {/* RapidAPI Key input */}
                <div>
                  <label
                    htmlFor="rapidapi-key"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    {p.rapidapiKey || "X-RapidAPI-Key"}
                  </label>
                  <input
                    id="rapidapi-key"
                    type="password"
                    value={rapidapiKey}
                    onChange={(e) => setRapidapiKey(e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#60A5FA]/50 focus:ring-1 focus:ring-[#60A5FA]/20 transition-colors font-mono"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    {p.rapidapiKeyHint ||
                      "Find it at rapidapi.com/developer/apps"}
                  </p>
                </div>

                {/* Next button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => setStep(2)}
                    className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {p.step2 || "Preview"}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ---- STEP 2: Preview & Configure ---- */}
        {step === 2 && preview && (
          <section
            className="animate-fade-in-up space-y-4"
            aria-labelledby="step2-title"
          >
            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2
                  id="step2-title"
                  className="text-sm font-semibold text-white"
                >
                  {preview.total} {p.endpoints || "endpoints found"}
                  {alreadyRegisteredCount > 0 && (
                    <span className="ml-2 text-gray-500">
                      ({alreadyRegisteredCount}{" "}
                      {p.alreadyRegistered || "already registered"})
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-[#60A5FA] hover:text-[#60A5FA]/80 transition-colors"
                >
                  Select All
                </button>
                <span className="text-gray-600 text-xs">&middot;</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Endpoint list */}
            <div className="glass-card rounded-xl divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {preview.endpoints.map((ep, idx) => {
                const isSelected = selected.has(idx);
                const isDisabled = ep.already_registered;
                return (
                  <label
                    key={`${ep.method}-${ep.path}`}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : isSelected
                          ? "bg-[#60A5FA]/5"
                          : "hover:bg-white/3"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleSelect(idx)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#60A5FA] focus:ring-[#60A5FA]/20"
                    />
                    <MethodBadge method={ep.method} />
                    <span className="text-sm text-white font-mono truncate flex-1">
                      {ep.path}
                    </span>
                    {ep.name && (
                      <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[200px]">
                        {ep.name}
                      </span>
                    )}
                    {isDisabled && (
                      <span className="text-xs text-gray-500 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                        {p.alreadyRegistered || "Already registered"}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Price + Tags config */}
            <div className="glass-card rounded-xl p-6 space-y-5">
              {/* Default price */}
              <div>
                <label
                  htmlFor="default-price"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {p.defaultPrice || "Default price per call (USDC)"}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="default-price"
                    type="range"
                    min={0.001}
                    max={1}
                    step={0.001}
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    className="flex-1 accent-[#60A5FA]"
                  />
                  <span className="text-sm font-mono text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 min-w-[80px] text-center">
                    ${defaultPrice.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>$0.001</span>
                  <span>$1.000</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label
                  htmlFor="tags-input"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {p.tags || "Tags (comma-separated)"}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-0.5 hover:text-white transition-colors"
                        aria-label={`Remove tag ${tag}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  id="tags-input"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  onBlur={handleTagsBlur}
                  placeholder="rapidapi, weather, data..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#60A5FA]/50 focus:ring-1 focus:ring-[#60A5FA]/20 transition-colors"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={() => setStep(3)}
                className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {p.step3 || "Import"}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* ---- STEP 3: Sign & Import ---- */}
        {step === 3 && preview && (
          <section
            className="glass-card rounded-xl p-6 sm:p-8 animate-fade-in-up space-y-6"
            aria-labelledby="step3-title"
          >
            <h2 id="step3-title" className="text-lg font-semibold text-white">
              {p.signImport || "Sign & Import"}
            </h2>

            {/* Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {p.endpoints || "Endpoints"}
                </span>
                <span className="text-white font-semibold">
                  {selected.size}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {p.defaultPrice || "Price per call"}
                </span>
                <span className="text-white font-mono">
                  ${defaultPrice.toFixed(3)} USDC
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {p.rapidapiKey || "X-RapidAPI-Key"}
                </span>
                <span className="text-white font-mono text-xs">
                  {"*".repeat(8)}...{rapidapiKey.slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{p.host || "Host"}</span>
                <span className="text-white font-mono text-xs">
                  {rapidapiHost}
                </span>
              </div>
              {tags.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{p.tags || "Tags"}</span>
                  <span className="text-white text-xs">{tags.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/5" />

            {/* Error */}
            {importError && (
              <p
                role="alert"
                className="text-[#EF4444] text-xs flex items-center gap-2 p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {importError}
              </p>
            )}

            {/* Connect wallet or Sign */}
            {!isConnected ? (
              <div className="text-center space-y-3">
                <p className="text-gray-400 text-sm">
                  {p.connectFirst || "Connect your wallet first"}
                </p>
                <button
                  type="button"
                  onClick={() => connect({ client: thirdwebClient, wallets })}
                  className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSigning || isImporting}
                  onClick={handleSignAndImport}
                  className="gradient-btn px-8 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSigning ? (
                    <>
                      <Spinner />
                      Signing...
                    </>
                  ) : isImporting ? (
                    <>
                      <Spinner />
                      {p.importing || "Importing..."}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      {p.signImport || "Sign & Import"}
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ---- STEP 4: Success ---- */}
        {step === 4 && results && (
          <section
            className="glass-card rounded-xl p-6 sm:p-8 animate-fade-in-up text-center space-y-6"
            aria-labelledby="step4-title"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#34D399]/10 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-[#34D399]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 id="step4-title" className="text-2xl font-bold text-white">
              {p.success || "Import successful!"}
            </h2>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div>
                <span className="text-2xl font-bold text-[#34D399]">
                  {results.imported}
                </span>
                <p className="text-gray-400">
                  {p.imported || "services imported"}
                </p>
              </div>
              {results.skipped > 0 && (
                <div>
                  <span className="text-2xl font-bold text-gray-500">
                    {results.skipped}
                  </span>
                  <p className="text-gray-400">
                    {p.skipped || "skipped (already registered)"}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/services"
                className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all no-underline"
              >
                {p.viewServices || "View on x402 Bazaar"}
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-400 border border-white/10 hover:bg-white/5 transition-all"
              >
                Import Another
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
