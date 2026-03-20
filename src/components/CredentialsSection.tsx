import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

// ---- Types ----
export type CredentialType = 'bearer' | 'header' | 'basic' | 'query';

export interface CredentialItem {
  key: string;
  value: string;
}

export interface CredentialsPayload {
  type: CredentialType;
  credentials: Array<{ key: string; value: string; location: CredentialType }>;
}

interface CredentialsSectionProps {
  showCredentials: boolean;
  onToggle: () => void;
  credentialType: CredentialType;
  onTypeChange: (type: CredentialType) => void;
  credentialItems: CredentialItem[];
  onItemsChange: (items: CredentialItem[]) => void;
}

// ---- Auth type config ----
const AUTH_TYPES: Array<{ value: CredentialType; labelKey: string }> = [
  { value: 'bearer', labelKey: 'bearer' },
  { value: 'header', labelKey: 'header' },
  { value: 'basic', labelKey: 'basic' },
  { value: 'query', labelKey: 'query' },
];

// ---- Eye icon (show/hide) ----
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ---- Lock icon ----
function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

// ---- Chevron icon ----
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ---- Single credential row ----
function CredentialRow({
  item,
  index,
  total,
  credentialType,
  c,
  onChange,
  onRemove,
}: {
  item: CredentialItem;
  index: number;
  total: number;
  credentialType: CredentialType;
  c: Record<string, string>;
  onChange: (index: number, field: 'key' | 'value', val: string) => void;
  onRemove: (index: number) => void;
}) {
  const [showValue, setShowValue] = useState(false);

  const keyPlaceholder =
    credentialType === 'bearer' ? c.keyPlaceholderBearer :
    credentialType === 'basic'  ? c.keyPlaceholderBasic :
    credentialType === 'query'  ? c.keyPlaceholderQuery :
    c.keyPlaceholderHeader;

  const valuePlaceholder =
    credentialType === 'bearer' ? c.valuePlaceholderBearer :
    credentialType === 'basic'  ? c.valuePlaceholderBasic :
    credentialType === 'query'  ? c.valuePlaceholderQuery :
    c.valuePlaceholderHeader;

  return (
    <div className="flex items-center gap-2">
      {/* Key field — hidden for bearer (auto-filled) */}
      {credentialType !== 'bearer' ? (
        <div className="flex-1 min-w-0">
          <label htmlFor={`cred-key-${index}`} className="sr-only">
            {c.key} {index + 1}
          </label>
          <input
            id={`cred-key-${index}`}
            type="text"
            value={item.key}
            onChange={(e) => onChange(index, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            autoComplete="off"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-colors"
          />
        </div>
      ) : (
        /* Bearer: show fixed "Authorization" label as readonly */
        <div className="flex-1 min-w-0">
          <div className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2 text-sm text-gray-500 font-mono select-none">
            Authorization
          </div>
        </div>
      )}

      {/* Value field */}
      <div className="flex-[1.5] min-w-0 relative">
        <label htmlFor={`cred-val-${index}`} className="sr-only">
          {c.value} {index + 1}
        </label>
        <input
          id={`cred-val-${index}`}
          type={showValue ? 'text' : 'password'}
          value={item.value}
          onChange={(e) => onChange(index, 'value', e.target.value)}
          placeholder={valuePlaceholder}
          autoComplete="new-password"
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-colors font-mono"
        />
        <button
          type="button"
          onClick={() => setShowValue((v) => !v)}
          aria-label={showValue ? (c.hideValue || 'Hide value') : (c.showValue || 'Show value')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <EyeIcon open={showValue} />
        </button>
      </div>

      {/* Remove button — only when more than one row */}
      {total > 1 && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove credential ${index + 1}`}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ---- Main CredentialsSection component ----
export default function CredentialsSection({
  showCredentials,
  onToggle,
  credentialType,
  onTypeChange,
  credentialItems,
  onItemsChange,
}: CredentialsSectionProps) {
  const { t } = useTranslation();
  const c = ((t as unknown) as Record<string, Record<string, string>>).credentials || {};

  const handleItemChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...credentialItems];
    updated[index] = { ...updated[index], [field]: val };
    onItemsChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(credentialItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    if (credentialItems.length >= 10) return;
    onItemsChange([...credentialItems, { key: '', value: '' }]);
  };

  const handleTypeChange = (type: CredentialType) => {
    onTypeChange(type);
    // Auto-fill key for bearer and basic
    if (type === 'bearer' || type === 'basic') {
      onItemsChange(credentialItems.map((item) => ({ ...item, key: 'Authorization' })));
    } else {
      // Clear auto-filled keys so user can type their own
      onItemsChange(credentialItems.map((item) => ({
        ...item,
        key: item.key === 'Authorization' ? '' : item.key,
      })));
    }
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={showCredentials}
        aria-controls="credentials-panel"
        className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm text-gray-400">
          <LockIcon />
          <span>{c.toggle || 'My API requires authentication'}</span>
          <span className="text-[10px] text-gray-600 font-normal ml-1">(optional)</span>
        </span>
        <ChevronIcon open={showCredentials} />
      </button>

      {/* Collapsible panel */}
      {showCredentials && (
        <div
          id="credentials-panel"
          className="px-4 pb-4 pt-3 space-y-4 bg-white/2"
          role="group"
          aria-label={c.title || 'API Authentication'}
        >
          {/* Auth type selector */}
          <fieldset>
            <legend className="block text-xs font-medium text-gray-400 mb-2">
              {c.type || 'Auth Type'}
            </legend>
            <div className="flex flex-wrap gap-2" role="group">
              {AUTH_TYPES.map(({ value, labelKey }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={credentialType === value}
                  onClick={() => handleTypeChange(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                    credentialType === value
                      ? 'bg-[#FF9900]/15 border-[#FF9900]/50 text-[#FF9900]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {c[labelKey] || labelKey}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Column headers */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                {credentialType === 'bearer'
                  ? 'Header'
                  : credentialType === 'query'
                  ? 'Param Name'
                  : credentialType === 'basic'
                  ? 'Header'
                  : (c.key || 'Key / Header Name')}
              </span>
            </div>
            <div className="flex-[1.5] min-w-0">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                {credentialType === 'bearer'
                  ? 'API Key / Token'
                  : credentialType === 'basic'
                  ? 'user:password'
                  : (c.value || 'Value / Secret')}
              </span>
            </div>
            {/* Spacer for the remove button column */}
            {credentialItems.length > 1 && <div className="w-7 shrink-0" aria-hidden="true" />}
          </div>

          {/* Credential rows */}
          <div className="space-y-2" role="list" aria-label="Credential entries">
            {credentialItems.map((item, idx) => (
              <div key={idx} role="listitem">
                <CredentialRow
                  item={item}
                  index={idx}
                  total={credentialItems.length}
                  credentialType={credentialType}
                  c={c}
                  onChange={handleItemChange}
                  onRemove={handleRemoveItem}
                />
              </div>
            ))}
          </div>

          {/* Add more */}
          {credentialItems.length < 10 && (
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 text-xs text-[#FF9900] hover:text-[#FEBD69] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {c.addMore || 'Add credential'}
            </button>
          )}

          {/* Security notice */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[#34D399]/5 border border-[#34D399]/15">
            <LockIcon />
            <p className="text-[#34D399]/80 text-xs leading-relaxed">
              {c.encrypted || 'Encrypted with AES-256-GCM. Never exposed in API responses.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Helper: build credentials payload from state ----
export function buildCredentialsPayload(
  credentialType: CredentialType,
  credentialItems: CredentialItem[],
): CredentialsPayload | undefined {
  const filled = credentialItems.filter((item) => item.value.trim() !== '');
  if (filled.length === 0) return undefined;

  return {
    type: credentialType,
    credentials: filled.map((item) => ({
      key: credentialType === 'bearer' || credentialType === 'basic'
        ? 'Authorization'
        : item.key.trim(),
      value: item.value.trim(),
      location: credentialType,
    })),
  };
}
