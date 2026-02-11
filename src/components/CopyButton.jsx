import { useState } from 'react';

export default function CopyButton({ text, label = 'Copy', copiedLabel = 'Copied' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in insecure contexts
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 px-2.5 py-1 text-xs rounded-md bg-white/10 hover:bg-white/20
                 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer border-none"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
