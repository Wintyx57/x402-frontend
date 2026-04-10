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
    <a href="https://basescan.org"><img src="https://img.shields.io/badge/chain-Base%20%2B%20SKALE%20%2B%20Polygon-8b5cf6?style=flat-square" alt="Chain"></a>
  </p>
</p>

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6) ![React](https://img.shields.io/badge/React-19-61DAFB) ![Vercel](https://img.shields.io/badge/deploy-Vercel-black) ![Website](https://img.shields.io/website?url=https%3A%2F%2Fx402bazaar.org)

---

## What is x402 Bazaar?

x402 Bazaar is an autonomous API marketplace built on the [HTTP 402 Payment Required](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/402) standard. Developers browse services, register their own APIs, and connect their wallets to pay in USDC -- all from a glassmorphism web interface with full bilingual support (English / French).

## Key Features

- **Service Catalog** -- Browse, search, and filter 112+ API services with real-time data from the backend.
- **Register Your API** -- Submit your own API service to the marketplace with an on-chain USDC payment.
- **Wallet Connect** -- MetaMask and Coinbase Wallet via wagmi/viem with automatic network detection (Base, SKALE on Base, Polygon).
- **ChainSelector** -- 3-way toggle (Base / SKALE on Base / Polygon) for multi-chain payment routing.
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
| `/services/:id` | Service Detail | Individual service page with full description and reviews |
| `/register` | Register | Service registration form with USDC payment flow |
| `/developers` | Developers | API documentation, protocol reference, code examples |
| `/integrate` | Integrate | Integration guides for MCP, ChatGPT, LangChain, and CLI |
| `/mcp` | MCP | MCP server installation for Claude Desktop, Cursor, VS Code, Claude Code |
| `/playground` | Playground | Interactive API playground to test endpoints live |
| `/compare` | Compare | Side-by-side price comparison across services |
| `/docs` | Docs | Full platform documentation |
| `/status` | Status | Service uptime and health monitoring |
| `/analytics` | Analytics | Public usage analytics and traffic stats |
| `/budget` | Budget | Budget calculator for API cost planning |
| `/faq` | FAQ | Frequently asked questions |
| `/creators` | Creators | Guide and benefits for API creators/providers |
| `/quickstart` | Quickstart | Quick start guide to integrate x402 in minutes |

## Project Structure

```
src/
  main.tsx                 Entry point (WagmiProvider, QueryClient, BrowserRouter, LanguageProvider)
  App.tsx                  Route definitions
  config.ts                API URL + USDC contract ABI
  wagmi.ts                 Wallet config (Base + Base Sepolia, injected + coinbaseWallet)
  index.css                Tailwind v4 + custom utilities (glass, glow, gradients, animations)

  i18n/
    translations.ts        EN + FR translation strings (~110 keys per language)
    LanguageContext.tsx     React Context + useTranslation() hook + localStorage

  components/
    Navbar.tsx             Sticky glass navbar + 3 dropdowns + burger menu mobile + language toggle
    ConnectButton.tsx      Wallet connect/disconnect + responsive compact mode
    ServiceCard.tsx        Glass card with glow hover + x402 Native badge
    CategoryIcon.tsx       Category icon mapper for service cards
    LanguageToggle.tsx     FR/EN toggle pill
    ScrollToTop.tsx        Scroll reset on route change

  pages/
    Home.tsx               Hero glow orbs, animated stats, categories, how-it-works
    Services.tsx           Service grid + glass search input + skeleton loading
    Register.tsx           Glass form + USDC payment flow + validation
    Developers.tsx         API docs with scroll reveal + code examples
    Integrate.tsx          Agent integration guide (JS + Python, use cases)
    MCP.tsx                MCP server setup guide (CLI + manual accordion)
    Playground.tsx         Interactive API playground
    Compare.tsx            Side-by-side price comparison
    Docs.tsx               Full platform documentation
    Status.tsx             Service uptime monitoring
    Analytics.tsx          Public usage analytics
    Budget.tsx             Budget calculator
    FAQ.tsx                Frequently asked questions
    Creators.tsx           Guide for API providers
    Quickstart.tsx         Quick start guide

  hooks/
    useReveal.ts           IntersectionObserver for scroll animations
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Wallet | wagmi + viem (Base + SKALE on Base + Polygon) |
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
npm run test      # Run test suite (Vitest)
```

## Deployment

The frontend auto-deploys to Vercel on every push to `main`.

- **Production URL:** [x402bazaar.org](https://x402bazaar.org)
- **Vercel URL:** [x402-frontend-one.vercel.app](https://x402-frontend-one.vercel.app)
- **DNS:** Namecheap A record -> Vercel, SSL via Let's Encrypt

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started, coding standards, and the pull request process.

## Ecosystem

| Repository | Description |
|---|---|
| **[x402-backend](https://github.com/Wintyx57/x402-backend)** | API server, 112 native endpoints, payment middleware, MCP server |
| **[x402-frontend](https://github.com/Wintyx57/x402-frontend)** | React + TypeScript UI (this repo) |
| **[x402-bazaar-cli](https://github.com/Wintyx57/x402-bazaar-cli)** | `npx x402-bazaar` -- CLI with 7 commands |
| **[x402-sdk](https://github.com/Wintyx57/x402-sdk)** | TypeScript SDK for AI agents |
| **[x402-langchain](https://github.com/Wintyx57/x402-langchain)** | Python LangChain tools |
| **[x402-fast-monetization-template](https://github.com/Wintyx57/x402-fast-monetization-template)** | FastAPI template to monetize any Python function |

**Live:** [x402bazaar.org](https://x402bazaar.org) | **API:** [x402-api.onrender.com](https://x402-api.onrender.com) | **CLI:** `npx x402-bazaar init`

## License

MIT
