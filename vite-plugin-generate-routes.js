/**
 * vite-plugin-generate-routes.js
 * Generates pre-rendered HTML stubs for static routes at build time.
 * No puppeteer needed — just copies index.html with route-specific meta tags.
 * This ensures crawlers (Google, Twitter, Discord) get correct OG/SEO data without JS.
 */
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://x402bazaar.org';
const OG_IMAGE = 'https://x402bazaar.org/og-image.png';

const STATIC_ROUTES = [
  {
    path: '/services',
    title: 'API Services Catalog | x402 Bazaar',
    description: '70+ pay-per-call APIs for AI agents. Browse and compare endpoints across 11 categories. USDC micropayments on Base & SKALE.',
  },
  {
    path: '/pricing',
    title: 'Pricing | x402 Bazaar',
    description: 'Pay only for what you use. Micro-transactions from $0.0001 per call. No subscription, no API key required.',
  },
  {
    path: '/for-providers',
    title: 'For API Providers | x402 Bazaar',
    description: 'Monetize your API instantly. Register on x402 Bazaar and earn USDC per call. 95% revenue share, on-chain, instant.',
  },
  {
    path: '/register',
    title: 'Register Your API | x402 Bazaar',
    description: 'Add your API to x402 Bazaar marketplace. Free registration, 95% revenue share. Start earning USDC per API call.',
  },
  {
    path: '/compare',
    title: 'Compare API Monetization | x402 Bazaar',
    description: 'x402 Bazaar vs API keys vs subscriptions. Pay-per-call wins for AI agents — no friction, no churn, instant payouts.',
  },
  {
    path: '/quickstart',
    title: 'Quickstart Guide | x402 Bazaar',
    description: 'Get started with x402 Bazaar in minutes. Install the CLI, add USDC, and call your first API. No API key needed.',
  },
  {
    path: '/developers',
    title: 'Developer Documentation | x402 Bazaar',
    description: 'Technical docs for integrating x402 Bazaar APIs. SDK, CLI, HTTP 402 protocol reference, and code examples.',
  },
  {
    path: '/integrate',
    title: 'Integration Guide | x402 Bazaar',
    description: 'Integrate x402 Bazaar into your AI agent or app. Step-by-step guide for Base & SKALE chains.',
  },
  {
    path: '/mcp',
    title: 'MCP Server — Give AI Agents 70+ APIs | x402 Bazaar',
    description: 'Model Context Protocol server for x402 Bazaar. Give Claude, Cursor, and any MCP-compatible AI instant access to 70+ paid APIs.',
  },
  {
    path: '/playground',
    title: 'API Playground | x402 Bazaar',
    description: 'Try x402 Bazaar APIs live in the browser. Test endpoints, see real responses, pay with testnet USDC.',
  },
  {
    path: '/demos',
    title: 'Agent Demos | x402 Bazaar',
    description: 'Live demos of AI agents using x402 Bazaar APIs autonomously. See real pay-per-call transactions on Base & SKALE.',
  },
  {
    path: '/docs',
    title: 'Documentation | x402 Bazaar',
    description: 'Full documentation for x402 Bazaar. API reference, SDK guides, x402 protocol specs, and integration tutorials.',
  },
  {
    path: '/blog',
    title: 'Blog | x402 Bazaar',
    description: 'Articles about x402 protocol, AI agent monetization, USDC micropayments, and API marketplace news.',
  },
  {
    path: '/about',
    title: 'About x402 Bazaar — The First AI-Native API Marketplace',
    description: 'x402 Bazaar is the first AI-native API marketplace powered by HTTP 402 micropayments. Built for autonomous AI agents.',
  },
  {
    path: '/faq',
    title: 'FAQ | x402 Bazaar',
    description: 'Frequently asked questions about x402 Bazaar: USDC payments, API registration, revenue split, and the x402 protocol.',
  },
  {
    path: '/status',
    title: 'System Status | x402 Bazaar',
    description: 'Real-time operational status of x402 Bazaar APIs, blockchain endpoints, and infrastructure.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | x402 Bazaar',
    description: 'x402 Bazaar privacy policy. No personal data collected, no cookies, no tracking. GDPR compliant.',
  },
  {
    path: '/terms',
    title: 'Terms of Service | x402 Bazaar',
    description: 'x402 Bazaar terms of service. Pay-per-call API marketplace governed by French law. Crypto risk disclosures included.',
  },
  {
    path: '/legal',
    title: 'Legal Notice | x402 Bazaar',
    description: 'Legal notice (Mentions légales) for x402 Bazaar. LCEN-compliant publication information, editor and host details.',
  },
  {
    path: '/analytics',
    title: 'Analytics | x402 Bazaar',
    description: 'x402 Bazaar usage analytics, API call metrics, and marketplace growth dashboard.',
  },
  {
    path: '/config',
    title: 'Configuration | x402 Bazaar',
    description: 'Configure your x402 Bazaar integration. Set chain preferences, wallet, and payment settings.',
  },
  {
    path: '/fund',
    title: 'Fund Your Wallet — Get USDC on Base | x402 Bazaar',
    description: 'Get USDC from any chain to Base in 1 click. Bridge from Ethereum, Polygon, Arbitrum, or Optimism. Pay for APIs instantly.',
  },
];

function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function patchMeta(html, route) {
  const title = esc(route.title);
  const desc = esc(route.description);
  const url = `${BASE_URL}${route.path}`;

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:image" content=")[^"]*"/, `$1${OG_IMAGE}"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`);
}

export function generateRoutePages() {
  return {
    name: 'vite-generate-route-pages',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve('dist');
      const indexPath = path.join(distDir, 'index.html');

      if (!fs.existsSync(indexPath)) {
        console.warn('[generate-routes] dist/index.html not found, skipping');
        return;
      }

      const indexHtml = fs.readFileSync(indexPath, 'utf-8');
      let count = 0;

      for (const route of STATIC_ROUTES) {
        const routeName = route.path.slice(1); // strip leading /
        const outputPath = path.join(distDir, `${routeName}.html`);

        // Don't overwrite if already generated
        if (fs.existsSync(outputPath)) continue;

        const patched = patchMeta(indexHtml, route);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, patched, 'utf-8');
        count++;
      }

      console.log(`[generate-routes] Generated ${count} route HTML files`);
    },
  };
}
