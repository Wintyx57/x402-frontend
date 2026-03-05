import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useScrollSpy } from '../hooks/useScrollSpy';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';
import DocsSidebar from '../components/DocsSidebar';
import { SECTION_IDS, STATIC_ENDPOINTS } from './docs/data';
import Quickstart from './docs/Quickstart';
import Protocol from './docs/Protocol';
import ApiReference from './docs/ApiReference';
import NativeWrappers from './docs/NativeWrappers';
import McpSection from './docs/McpSection';
import IntegrationSection from './docs/IntegrationSection';
import SecuritySection from './docs/SecuritySection';

interface Endpoint {
  method: string;
  route: string;
  price: string | null;
  description: string;
}

function parseEndpoints(raw: Record<string, unknown>): { marketplace: Endpoint[]; native: Endpoint[] } {
  const marketplace: Endpoint[] = [];
  const native: Endpoint[] = [];
  Object.entries(raw).forEach(([key, desc]) => {
    const match = key.match(/^(GET|POST)\s+(.+)$/);
    if (!match) return;
    const method = match[1];
    const route = match[2];
    const descStr = String(desc);
    const priceMatch = descStr.match(/\((\d+(?:\.\d+)?)\s*USDC\)/);
    const price = priceMatch ? priceMatch[1] : null;
    const description = descStr.replace(/\s*\(\d+(?:\.\d+)?\s*USDC\)/, '').trim();
    const entry = { method, route, price, description };
    if (route.startsWith('/api/')) native.push(entry);
    else marketplace.push(entry);
  });
  return { marketplace, native };
}

export default function Docs() {
  const { t, lang } = useTranslation();
  const d = t.docs || {};
  const [endpointsRaw, setEndpointsRaw] = useState<Record<string, unknown> | null | undefined>(undefined);
  const activeSection = useScrollSpy(SECTION_IDS);

  useSEO({
    title: 'Documentation — x402 Protocol, API Reference & SDK',
    description: 'Complete technical documentation for x402 Bazaar: HTTP 402 protocol specification, REST API reference, 69 native wrappers, MCP server setup, CLI usage, LangChain integration and security guidelines.',
    keywords: 'x402 documentation, HTTP 402 protocol spec, x402 API reference, MCP server docs, x402 SDK, LangChain integration docs, USDC micropayment tutorial',
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(API_URL + '/', { signal: controller.signal })
      .then(r => r.json())
      .then(data => setEndpointsRaw(data.endpoints || null))
      .catch(() => { if (!controller.signal.aborted) setEndpointsRaw(null); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      if (SECTION_IDS.includes(id)) {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, []);

  const handleNavigate = (id: string) => {
    if (!SECTION_IDS.includes(id)) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const sections = [
    { id: 'quickstart', label: d.sidebarQuickstart || 'Quickstart' },
    { id: 'protocol', label: d.sidebarProtocol || 'Protocol' },
    { id: 'api-reference', label: d.sidebarApiRef || 'API Reference' },
    { id: 'native-wrappers', label: d.sidebarNative || 'Native Wrappers' },
    { id: 'mcp', label: d.sidebarMcp || 'MCP Server' },
    { id: 'integration', label: d.sidebarIntegration || 'Integration' },
    { id: 'security', label: d.sidebarSecurity || 'Security' },
  ];

  const parsed = endpointsRaw ? parseEndpoints(endpointsRaw) : null;
  const apiData = parsed || STATIC_ENDPOINTS;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-medium mb-4">
          Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{d.title || 'Documentation'}</h1>
        <p className="text-gray-400 text-lg max-w-2xl">{d.subtitle || ''}</p>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex gap-8">
        <DocsSidebar sections={sections} activeSection={activeSection} onNavigate={handleNavigate} />

        <main className="flex-1 min-w-0 space-y-16">
          <Quickstart d={d} />
          <Protocol d={d} />
          <ApiReference d={d} endpointsRaw={endpointsRaw} apiData={apiData} parsed={parsed} />
          <NativeWrappers d={d} />
          <McpSection d={d} lang={lang} />
          <IntegrationSection d={d} />
          <SecuritySection d={d} />
        </main>
      </div>
    </div>
  );
}
