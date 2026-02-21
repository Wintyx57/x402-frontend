interface Props { d: Record<string, string>; lang: string; }

import { Link } from 'react-router-dom';
import { DocsCodeBlock } from './shared';
import { MCP_TOOLS } from './data';

export default function McpSection({ d, lang }: Props) {
  return (
    <section id="mcp">
      <h2 className="text-2xl font-bold text-white mb-3">{d.mcpTitle || 'MCP Server'}</h2>
      <p className="text-gray-400 text-sm mb-6">{d.mcpDesc || ''}</p>

      <h3 className="text-white font-semibold mb-3">{d.mcpToolsTitle || 'Available Tools'}</h3>
      <div className="space-y-2 mb-6">
        {MCP_TOOLS.map(tool => (
          <div key={tool.name} className="glass-card rounded-lg p-3 flex items-center gap-3">
            <code className="text-[#FF9900] font-mono text-xs bg-[#FF9900]/10 px-2 py-1 rounded shrink-0">{tool.name}</code>
            <span className="text-gray-400 text-sm flex-1">{lang === 'fr' ? tool.desc_fr : tool.desc_en}</span>
            <span className={`shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded ${
              tool.cost === 'Free' ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-[#FF9900]/10 text-[#FF9900]'
            }`}>
              {tool.cost === 'Free' ? (lang === 'fr' ? 'Gratuit' : 'Free') : tool.cost}
            </span>
          </div>
        ))}
      </div>

      <h3 className="text-white font-semibold mb-3">{d.mcpInstall || 'Install with one command:'}</h3>
      <DocsCodeBlock code="npx x402-bazaar init" />

      <div className="mt-4">
        <Link to="/mcp" className="text-[#FF9900] hover:text-[#FFB84D] text-sm font-medium no-underline inline-flex items-center gap-1">
          {d.mcpFullDoc || 'Full MCP documentation'} →
        </Link>
      </div>
    </section>
  );
}
