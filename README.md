# x402 Bazaar — Frontend

The web interface for x402 Bazaar, the autonomous marketplace where AI agents discover, pay for, and consume API services using the HTTP 402 protocol on Base.

**Live:** https://x402bazaar.org | **Backend:** https://x402-api.onrender.com

## Features

- Browse and search API services
- Register new services with on-chain USDC payment
- MCP server installation guide for AI IDEs
- Agent integration documentation with code examples
- Wallet connect (MetaMask, Coinbase Wallet) via wagmi
- Bilingual interface (English / French)
- Responsive design with glassmorphism UI

## Quick Start

```bash
git clone https://github.com/Wintyx57/x402-frontend.git
cd x402-frontend
npm install
cp .env.example .env   # Set VITE_API_URL
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: https://x402-api.onrender.com) |
| `VITE_NETWORK` | `mainnet` or `testnet` |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, stats, categories, how-it-works |
| `/services` | Service catalog with search, filters, sorting |
| `/register` | Register a new API service (USDC payment) |
| `/mcp` | MCP server installation guide (Claude, Cursor, VS Code) |
| `/integrate` | Agent integration guide (JS + Python examples) |
| `/developers` | API documentation and protocol reference |

## Tech Stack

- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS v4
- **Wallet:** wagmi + viem (Base chain)
- **Routing:** React Router v7
- **i18n:** Custom context (EN/FR) with localStorage persistence
- **Deployment:** Vercel (auto-deploy on push)

## Project Structure

```
src/
  main.jsx              → Entry point (providers, router)
  App.jsx               → Route definitions
  config.js             → API URL + USDC ABI
  wagmi.js              → Wallet config (Base + Base Sepolia)
  i18n/
    translations.js     → EN + FR strings
    LanguageContext.jsx  → i18n React context
  components/
    Navbar.jsx           → Navigation (marketplace / developer groups)
    ConnectButton.jsx    → Wallet connect/disconnect
    ServiceCard.jsx      → Service display card
    LanguageToggle.jsx   → FR/EN toggle
    ScrollToTop.jsx      → Scroll reset on navigation
  pages/
    Home.jsx             → Landing page
    Services.jsx         → Service catalog
    Register.jsx         → Service registration form
    MCP.jsx              → MCP server guide
    Integrate.jsx        → Agent integration guide
    Developers.jsx       → API documentation
  hooks/
    useReveal.js         → Scroll animation (IntersectionObserver)
```

## License

ISC
