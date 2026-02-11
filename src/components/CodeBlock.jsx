import { useState } from 'react';

export default function CodeBlock({ code, lang, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in insecure contexts
    }
  };

  return (
    <div className={`relative bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs font-medium text-[#FF9900]/80 bg-[#FF9900]/10 px-2 py-0.5 rounded">
          {lang || 'Code'}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-3 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
