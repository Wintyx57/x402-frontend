<p align="center">
  <h1 align="center">x402 Bazaar — Frontend</h1>
  <p align="center">
    <strong>The web interface for the API marketplace where AI agents pay with USDC, not API keys.</strong>
  </p>
  <p align="center">
    <a href="https://x402bazaar.org"><img src="https://img.shields.io/badge/website-x402bazaar.org-blue?style=flat-square" alt="Website"></a>
    <a href="https://www.npmjs.com/package/x402-bazaar"><img src="https://img.shields.io/npm/v/x402-bazaar?style=flat-square&color=green" alt="CLI"></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="License"></a>
    <a href="https://github.com/Wintyx57/x402-frontend"><img src="https://img.shields.io/github/stars/Wintyx57/x402-frontend?style=flat-square" alt="Stars"></a>
    <a href="https://basescan.org"><img src="https://img.shields.io/badge/chain-Base%20%2B%20SKALE-8b5cf6?style=flat-square" alt="Chain"></a>
  </p>
</p>

<!-- screenshot here -->

---

## What is x402 Bazaar?

x402 Bazaar is an autonomous API marketplace built on the [HTTP 402 Payment Required](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/402) standard. Developers browse services, register their own APIs, and connect their wallets to pay in USDC -- all from a glassmorphism web interface with full bilingual support (English / French).

## Key Features

- **Service Catalog** -- Browse, search, and filter 70+ API services with real-time data from the backend.
- **Register Your API** -- Submit your own API service to the marketplace with an on-chain USDC payment.
- **Wallet Connect** -- MetaMask and Coinbase Wallet via wagmi/viem with automatic Base network detection.
- **MCP Installation Guide** -- Step-by-step setup for Claude Desktop, Cursor, VS Code, and Claude Code.
- **Agent Integration Docs** -- Code examples in JavaScript and Python for building x402 agents.
- **One-Line CLI** -- `npx x402-bazaar init` prominently featured for instant setup.
- **Bilingual (EN/FR)** -- Full i18n with localStorage persistence and toggle in the navbar.
- **Glassmorphism UI** -- Glass cards, glow effects, gradient buttons, animated hero, scroll reveal animations.
- **Responsive** -- Mobile-first design with burger menu and compact wallet display.
- **SEO Optimized** -- Meta tags, Open Graph, Twitter Cards, sitemap.xml, robots.txt, structured data.

## Quick Start

```bash
git clone https://github.com/Wintyx57/x402-frontend.git
cd x402-frontend
npm install
cp .env.example .env   # Set VITE_API_URL
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero with CLI one-liner, live stats, service categories, how-it-works flow |
| `/services` | Services | Searchable service catalog with glass cards, sorting, x402 Native badges |
| `/register` | Register | Service registration form with USDC payment flow |
| `/developers` | Developers | API documentation, protocol reference, code examples |
| `/integrate` | Integrate | Agent integration guide (JavaScript + Python, `payAndRequest` pattern) |
| `/mcp` | MCP | MCP server installation for Claude Desktop, Cursor, VS Code, Claude Code |

## Project Structure

```
src/
  main.jsx                 Entry point (WagmiProvider, QueryClient, BrowserRouter, LanguageProvider)
  App.jsx                  Route definitions
  config.js                API URL + USDC contract ABI
  wagmi.js                 Wallet config (Base + Base Sepolia, injected + coinbaseWallet)
  index.css                Tailwind v4 + custom utilities (glass, glow, gradients, animations)

  i18n/
    translations.js        EN + FR translation strings (~110 keys per language)
    LanguageContext.jsx     React Context + useTranslation() hook + localStorage

  components/
    Navbar.jsx             Sticky glass navbar + burger menu mobile + language toggle
    ConnectButton.jsx      Wallet connect/disconnect + responsive compact mode
    ServiceCard.jsx        Glass card with glow hover + x402 Native badge
    CategoryIcon.jsx       Category icon mapper for service cards
    LanguageToggle.jsx     FR/EN toggle pill
    ScrollToTop.jsx        Scroll reset on route change

  pages/
    Home.jsx               Hero glow orbs, animated stats, categories, how-it-works
    Services.jsx           Service grid + glass search input + skeleton loading
    Register.jsx           Glass form + USDC payment flow + validation
    Developers.jsx         API docs with scroll reveal + code examples
    Integrate.jsx          Agent integration guide (JS + Python, use cases)
    MCP.jsx                MCP server setup guide (CLI + manual accordion)

  hooks/
    useReveal.js           IntersectionObserver for scroll animations
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Wallet | wagmi + viem (Base chain) |
| Routing | React Router v7 |
| State | TanStack React Query |
| i18n | Custom React Context (EN/FR) |
| Deployment | Vercel (auto-deploy on push) |
| Domain | x402bazaar.org (Namecheap + Vercel DNS) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: `https://x402-api.onrender.com`) |
| `VITE_NETWORK` | `mainnet` or `testnet` |

## Scripts

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Deployment

The frontend auto-deploys to Vercel on every push to `main`.

- **Production URL:** [x402bazaar.org](https://x402bazaar.org)
- **Vercel URL:** [x402-frontend-one.vercel.app](https://x402-frontend-one.vercel.app)
- **DNS:** Namecheap A record -> Vercel, SSL via Let's Encrypt

## Contributing

Contributions are welcome. Please open an issue to discuss proposed changes before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Links

- **Website:** [x402bazaar.org](https://x402bazaar.org)
- **Backend repo:** [github.com/Wintyx57/x402-backend](https://github.com/Wintyx57/x402-backend)
- **CLI:** `npx x402-bazaar init` | [npm](https://www.npmjs.com/package/x402-bazaar)
- **Live API:** [x402-api.onrender.com](https://x402-api.onrender.com)
- **Dashboard:** [x402-api.onrender.com/dashboard](https://x402-api.onrender.com/dashboard)

## License

MIT
