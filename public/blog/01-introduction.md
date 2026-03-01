---
title: "x402 Bazaar: 69 APIs Your AI Agents Can Pay For with USDC"
date: 2026-02-28
author: x402 Team
tags:
  - http-402
  - ai-agents
  - usdc
  - micropayments
  - guides
---

# x402 Bazaar: 69 APIs Your AI Agents Can Pay For with USDC

Imagine your AI agent needs to generate an image, check the weather, run code, or scrape a website. Today, that's complicated. Your agent would need a Stripe integration, API keys, complex billing logic, and manual payment reconciliation. It's messy, centralized, and expensive.

What if your AI agent could just... pay? Like a human swipping a credit card at a store. That's x402 Bazaar.

## What is HTTP 402? (The Forgotten HTTP Status Code)

In 1999, the HTTP specification defined status code `402: Payment Required`. It was ahead of its time. The idea was simple: when a client requests a resource that costs money, the server responds with 402 and payment instructions. Pay, then retry. The payment happens inline, as part of the API request.

For 25 years, it was ignored. No major payment infrastructure existed. Until blockchain made it feasible.

Today, x402 Bazaar makes HTTP 402 real. Here's how it works:

1. Your AI agent calls an API endpoint
2. The server responds with `402 Payment Required` + payment details
3. Your agent's wallet automatically pays in USDC (stablecoin)
4. The agent retries the request
5. This time, the server processes it and responds with 200 OK

No API keys. No stored credentials. No billing dashboard. Just code that pays code.

## Why AI Agents Need Autonomous Payments

Modern AI agents are becoming autonomous. They make decisions, execute tasks, and call external services. But most agents today are payment-blind. They can't:

- Pay for premium APIs when basic ones won't work
- Handle dynamic pricing (rush hour, peak demand)
- Negotiate with other agents ("I'll pay you 0.01 USDC to run this task")
- Access paid services the way humans do

This limits what agents can do. They're trapped in free-tier API quotas, outdated data, and limited functionality.

x402 Bazaar solves this. When your agent needs to call an API, it checks its budget. If it has funds, it pays. If it's out of budget, it chooses a cheaper alternative or escalates to a human. Agents become truly autonomous economic actors.

## 69 APIs Across 10 Categories

x402 Bazaar currently lists 69+ production APIs, built by creators like you. They span:

**Weather & Environmental Data** — Real-time weather, air quality, climate data
**Crypto & DeFi** — Price feeds, wallet data, transaction history
**Image Generation** — Stable Diffusion, DALL-E wrappers, image manipulation
**Code Execution** — Sandboxed Python, Node.js, shell execution
**Web Scraping & Browsing** — Navigate the web, extract data, follow links
**Text & NLP** — Sentiment analysis, summarization, translation
**Data Processing** — CSV parsing, database queries, complex transformations
**Machine Learning** — Model inference, fine-tuning, embeddings
**Content Generation** — Articles, social posts, marketing copy
**Utility Services** — DNS lookups, IP geolocation, email validation

Each service sets its own price. A simple lookup might cost 0.001 USDC. Complex image generation might be 0.10 USDC. The market sets the rates.

## How It Works in 3 Steps

### Step 1: Agent Makes a Request
```
GET /api/weather?lat=48.8566&lon=2.3522
Authorization: Bearer YOUR_AGENT_ID
```

### Step 2: Server Demands Payment (402)
```
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "chainId": 8453,           // Base blockchain
  "tokenAddress": "0xA0b86...", // USDC on Base
  "amount": "1000000",       // 1 USDC (6 decimals)
  "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
  "expiresAt": 1740000000
}
```

### Step 3: Agent Pays and Retries
```
// Agent's wallet auto-pays the USDC
const hash = await wallet.pay(paymentDetails);

// Retry with proof
GET /api/weather?lat=48.8566&lon=2.3522
Authorization: Bearer YOUR_AGENT_ID
X-Payment-Hash: 0xabc123...

// Response: 200 OK
{
  "temp": 8.5,
  "condition": "Cloudy",
  "humidity": 72
}
```

The entire flow is atomic. No payment, no access. Payment goes directly on-chain. No intermediaries. Instant settlement.

## The Tech Behind It

x402 Bazaar runs on:

- **Base & SKALE** — EVM-compatible blockchains with cheap transactions
- **USDC** — The stablecoin that never fluctuates
- **Viem & Ethers.js** — Libraries for blockchain interaction
- **x402-langchain** — Python package for LangChain agents
- **MCP (Model Context Protocol)** — For Claude Desktop and Cursor integration

Your agent doesn't need to manage private keys. It works with a lightweight wallet that holds just enough USDC for the task at hand.

## Who's Using x402 Bazaar Today?

- **Autonomous Agents** — Claude via MCP, LangChain workflows, AutoGPT plugins
- **API Creators** — Teams monetizing specialized services (image gen, data, code execution)
- **Enterprises** — Internal tools that need pay-as-you-go API access
- **Web3 Teams** — Projects exploring agent-to-agent payments

164+ on-chain payments have been processed. 74 services are live. The network is growing.

## Get Started in 60 Seconds

**Install the CLI:**
```bash
npx x402-bazaar init
```

**Set your USDC budget:**
```bash
npx x402-bazaar set-budget 10  # 10 USDC
```

**Use in Python (LangChain):**
```python
from x402_langchain import X402Agent

agent = X402Agent(
    max_budget_usdc=5.0,
    chain="base"
)
result = agent.run("Check weather in Paris and generate a meme about it")
```

**Use in Claude Desktop (MCP):**
Ask Claude to do something that needs an external API:
> "Generate an image of a sunset over the ocean, check the weather in Bali, and write a haiku about it"

Claude automatically pays for the images and weather data. You only see the haiku.

## What's Next?

We're expanding to:
- **More chains** — Optimism, Arbitrum, Ethereum L2s
- **More integrations** — Langchain tools, OpenAI plugins, Zapier
- **Mobile agents** — Agents running on-device with local wallets
- **Agent marketplaces** — Agents hiring other agents, creating value chains

## Ready?

- **Quickstart Guide:** [/docs/quickstart](/docs/quickstart)
- **API Playground:** [/playground](/playground)
- **Full Documentation:** [/docs](/docs)
- **GitHub:** [github.com/Wintyx57](https://github.com/Wintyx57)

The future of APIs is autonomous and decentralized. Your AI agent should be able to pay for what it needs, when it needs it. That's x402 Bazaar.

Welcome to the HTTP 402 era.
