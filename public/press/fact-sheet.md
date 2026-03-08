---
title: x402 Bazaar Press Kit - Fact Sheet
date: 2026-02-28
---

# x402 Bazaar — Fact Sheet

## One-Line Summary
x402 Bazaar is an autonomous marketplace where AI agents discover, call, and pay for 69+ APIs in USDC using HTTP 402 micropayments on blockchain.

## About x402 Bazaar

x402 Bazaar enables AI agents to make autonomous economic decisions. Instead of being limited to free APIs and complex payment integrations, agents can now call premium services and pay USDC instantly, on-chain. The marketplace runs on HTTP 402 (Payment Required), an internet standard defined 25 years ago but finally practical with blockchain.

## Key Statistics

| Metric | Value |
|--------|-------|
| APIs Available | 69+ |
| Services Listed | 74 |
| On-Chain Payments Processed | 164+ |
| Supported Blockchains | 2 (Base, SKALE) |
| Creator Payouts | 95% (5% platform fee) |
| Average API Cost | 0.01-0.15 USDC |
| Supported Clients | Claude Desktop, Cursor, VS Code, LangChain |
| Time to First API Call | < 2 minutes |

## Technology Stack

**Backend:**
- Node.js + Express
- 69 native REST endpoints
- Supabase (database)
- Coinbase SDK (crypto operations)
- MCP Server (Model Context Protocol)

**Frontend:**
- React 18 + Vite
- 20 pages
- Glassmorphism design
- Tailwind CSS v4
- i18n (FR/EN support)
- wagmi (blockchain wallet integration)

**CLI & SDKs:**
- x402-bazaar CLI (npm)
- x402-langchain (Python)
- AutoGPT plugin
- FastAPI monetization template

**Blockchain:**
- Base (Coinbase L2)
- SKALE (decentralized L1)
- USDC stablecoin
- Viem library for transactions

## How It Works

1. **Agent makes API call** — Requests data from x402 marketplace
2. **Server responds with 402** — Returns payment instructions + amount
3. **Agent pays USDC** — Wallet auto-signs transaction on blockchain
4. **Server processes** — Verifies payment on-chain, returns data
5. **Creator earns** — USDC deposited to wallet within minutes

No keys. No databases. No billing disputes. Pure economic transaction.

## Market Positioning

**For AI Agents:**
- Autonomous, decentralized payment model
- No API key management
- Fair pay-per-use pricing
- Access to 69+ premium services
- Budget controls and spending limits

**For API Creators:**
- 5-minute setup (one decorator)
- Instant, on-chain settlement
- 95% revenue retention
- Global reach
- Zero payment processing complexity

**For Enterprises:**
- Internal tools with pay-as-you-go access
- Precise cost allocation per department
- Transparent pricing
- Blockchain verification

## Team

**Founder/Lead Developer:**
- Wintyx57 (pseudonymous)
- 8+ years full-stack development
- 3+ years blockchain/DeFi experience

**Open Community:**
- 62+ API creators from around the world
- Community developers contributing plugins
- Active Discord/GitHub community

## Deployments

| Service | Status | URL |
|---------|--------|-----|
| **Website** | Live | https://x402bazaar.org |
| **Backend API** | Live | https://x402-api.onrender.com |
| **Frontend** | Live | https://x402-frontend-one.vercel.app |
| **npm Package** | Live | https://www.npmjs.com/package/x402-bazaar (v3.0.0) |
| **GitHub** | Active | https://github.com/Wintyx57 |

## Media & Press

**No logo, branding guidelines, or media kit yet.**

Media requests can include:
- Screenshots of the marketplace
- Command-line interface screenshots
- Architecture diagrams
- Live API playground demonstrations
- Dashboard analytics screenshots

## Contact Information

**Email:** x402bazaar@gmail.com

**GitHub:** https://github.com/Wintyx57

**Website:** https://x402bazaar.org

**Documentation:** https://x402bazaar.org/docs

## Key Links

- **Quickstart Guide:** https://x402bazaar.org/docs/quickstart
- **API Playground:** https://x402bazaar.org/playground
- **Creator Registration:** https://x402bazaar.org/register
- **MCP Setup:** https://x402bazaar.org/docs/mcp-setup
- **LangChain Integration:** https://x402bazaar.org/docs/langchain

## Interesting Facts

1. **Named After HTTP 402:** The HTTP specification defined status code 402 (Payment Required) in 1999. It was never used because no practical payment system existed. x402 Bazaar brings it to life with blockchain.

2. **164 Payments in 3 Months:** From zero to 164 on-chain payments in the first 3 months of launch, demonstrating strong early product-market fit.

3. **62 Community Creators:** 62 of the 74 services are built by community members, not the core team, showing strong ecosystem adoption.

4. **Sub-Second Latency:** API calls return in < 1 second including blockchain payment verification, making it practical for real-time applications.

5. **Global, Chainless:** Agents can pay from anywhere in the world, on any supported blockchain, without geographic restrictions.

## Comparison

| Feature | x402 Bazaar | Stripe | AWS API Gateway |
|---------|-------------|--------|-----------------|
| Setup time | 5 min | 2 days | 2 hours |
| Transaction fee | 5% | 2.9% + $0.30 | 3.5% |
| Settlement | Instant | 1-3 days | Daily |
| Works with agents | Yes | No | Limited |
| Per-call pricing | Yes | No | Tiered |
| Global payouts | Yes | Limited | Limited |
| No login required | Yes | No | No |

## Roadmap

**Q2 2026:**
- Support for Optimism and Arbitrum
- OpenAI plugin integration
- Enhanced LangChain tools
- Improved dashboard analytics

**Q3 2026:**
- Agent-to-agent payments
- Creator staking and revenue sharing
- Multi-signature wallet support
- Automated testing & quality assurance framework

**Q4 2026:**
- Mobile agent support
- Decentralized governance (DAO)
- Cross-chain atomic payments
- Advanced rate limiting and quotas

## References

- **EIP-402:** https://eips.ethereum.org/EIPS/eip-402
- **Model Context Protocol:** https://modelcontextprotocol.io
- **Base Blockchain:** https://base.org
- **SKALE Network:** https://skale.space
- **USDC:** https://www.circle.com/usdc

---

Last updated: 2026-02-28
