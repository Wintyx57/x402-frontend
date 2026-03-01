---
title: "MCP + x402: Claude Desktop Calls and Pays APIs By Itself"
date: 2026-02-28
author: x402 Team
tags:
  - mcp
  - claude-desktop
  - model-context-protocol
  - tutorials
  - ai-agents
---

# MCP + x402: Claude Desktop Calls and Pays APIs By Itself

You open Claude Desktop and ask:

> "Generate a professional headshot image, check the weather in Tokyo, and write a bio for my LinkedIn profile."

Within seconds, Claude returns:

1. A high-quality professional photo (generated with Stable Diffusion)
2. The current weather in Tokyo (real-time data)
3. A polished LinkedIn bio

You never explicitly paid for anything. You didn't enter API keys. You didn't write integration code.

Claude did it automatically. It:
- Identified which APIs it needed
- Called them
- Paid USDC from a wallet you set up once
- Combined the results
- Gave you the answer

That's MCP (Model Context Protocol) + x402 Bazaar in action.

## What is MCP?

The Model Context Protocol is Anthropic's standard for connecting AI models to external tools and data sources. Instead of models being isolated, they can call tools, read files, access databases, and take actions in the world.

In December 2024, Anthropic released MCP as an open standard. Now tools from any provider can plug into Claude Desktop, Cursor, VS Code, and other clients.

x402 Bazaar is an MCP server. Claude can use it to call APIs and pay automatically.

## Setup: 60 Seconds

### Step 1: Install x402-bazaar CLI

```bash
npm install -g x402-bazaar
```

### Step 2: Initialize Your Wallet

```bash
npx x402-bazaar init
```

This command:
- Generates a wallet (if you don't have one)
- Sets up USDC on Base blockchain
- Creates a config file at `~/.x402/config.json`
- Displays your wallet address

### Step 3: Fund Your Wallet

Send USDC to your wallet address. You can:
- Bridge USDC from Ethereum (via Stargate)
- Buy USDC directly on Base (Coinbase, Kraken, Uniswap)
- Request a test wallet (for demo purposes)

Start with $10. That's enough for thousands of API calls.

### Step 4: Connect to Claude Desktop

Add this to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "x402": {
      "command": "npx",
      "args": ["x402-bazaar", "mcp"],
      "disabled": false
    }
  }
}
```

Restart Claude Desktop. Done.

## Demo: Ask Claude Anything

Now open Claude and ask it to do something that needs APIs:

### Example 1: Weather + Text

> "What's the weather in Paris right now? Give me a fun fact about Paris based on the weather."

Claude automatically:
1. Calls the weather API (0.001 USDC)
2. Gets real-time data
3. Uses it to generate a fun fact
4. Shows you the result

Your wallet is charged 0.001 USDC. You never saw the API calls.

### Example 2: Image Generation

> "Create a professional logo for a company called 'DataFlow' that works with streaming analytics. Make it modern and minimalist."

Claude:
1. Uses Stable Diffusion via x402 (0.15 USDC)
2. Generates the image
3. Shows it to you
4. You can ask to regenerate or refine it (more calls, more USDC)

### Example 3: Complex Multi-Step Task

> "I'm launching a tech startup. Generate a professional header image, research the latest tech trends, write a 300-word pitch, and check the weather so I know what to wear to my first investor meeting in San Francisco."

Claude handles all of it:
- Image generation (0.15 USDC)
- Web scraping for trends (0.01 USDC)
- Text generation (free, built-in)
- Weather lookup (0.001 USDC)

Total cost: ~0.16 USDC (~0.16 cents). You got work that would cost $50-100 in freelance services.

## What Tools Are Available?

In Claude Desktop, you can use 69+ APIs across categories:

### Image & Design
- Generate images (DALL-E, Stable Diffusion)
- Manipulate images (resize, filter, compress)
- Create charts and graphs
- Design mockups

### Data & Research
- Real-time weather
- Crypto prices
- Web scraping
- Database queries
- News aggregation

### Code & Computation
- Run Python code safely
- Execute JavaScript
- Compile/test code
- Perform complex math

### Text Processing
- Summarization
- Translation
- Sentiment analysis
- Grammar checking
- Text formatting

### Utilities
- Email validation
- DNS lookup
- IP geolocation
- File conversion
- QR code generation

## How It Works Behind the Scenes

When you ask Claude to generate an image:

1. **Claude thinks:** "I need to call the x402 image generation API"
2. **Claude calls MCP:** Requests the tool through Model Context Protocol
3. **MCP requests payment:** Asks x402 for a 402 Payment Required response
4. **x402 returns:** Payment details (amount, recipient, expiry)
5. **MCP pays:** Your local wallet auto-signs and pays on-chain (takes <1 second)
6. **x402 processes:** Verifies payment, generates the image
7. **Claude gets result:** Image URL and metadata
8. **You see it:** Image embedded in Claude's response

All of this happens transparently. You just see the result.

## Budget Management

Set a daily or monthly spending limit:

```bash
# Set a daily limit
npx x402-bazaar set-budget --daily 1  # $1/day

# Set a monthly limit
npx x402-bazaar set-budget --monthly 10  # $10/month

# Check your balance
npx x402-bazaar balance

# Output:
# Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f...
# Balance: 8.234 USDC
# Monthly spent: 1.766 USDC
# Monthly limit: 10 USDC
# Days remaining: 18
```

When you hit your budget, Claude stops calling paid APIs. It tells you:
> "I've hit your API budget limit for today. I can still help with free tasks (writing, analysis, coding). Would you like to increase your budget?"

## Advanced: Custom APIs

You can add your own x402-compatible APIs to Claude:

```bash
npx x402-bazaar add-api \
  --name "my-custom-service" \
  --url "https://my-api.com/endpoint" \
  --price 0.05

# Now Claude can use it
```

## Supported Clients

x402 Bazaar works with any MCP-compatible client:

| Client | Status | Notes |
|--------|--------|-------|
| Claude Desktop | ✓ Active | Full support |
| Cursor | ✓ Active | In editor tools |
| VS Code + Continue | ✓ Active | LLM integration |
| ChatGPT (coming) | 🔄 Q2 2026 | Via plugin |
| LLaMA (local) | ✓ Partial | Self-hosted |

## Real-World Workflows

### Workflow 1: Content Creation

Open Claude and say:
> "Create 5 Instagram posts about productivity, with matching header images."

Claude generates text + images. Cost: ~$0.50. Professional designer would charge $100+.

### Workflow 2: Code Review Assistant

In Cursor, ask:
> "Review this code for security issues and test coverage."

Cursor uses x402 to run security scanners and code analysis. Cost: ~$0.10. Security audits usually cost $1000+.

### Workflow 3: Data Analysis

Upload a CSV to Claude:
> "Analyze this sales data. Generate charts showing trends, and create an executive summary."

Claude scrapes, analyzes, generates images. Cost: ~$0.30. Data analyst would take 2 hours.

### Workflow 4: Startup Launch

> "I want to launch my SaaS product. Generate a landing page, research competitors, and create social media assets."

Claude uses 8+ APIs to:
- Research competitors (0.02 USDC)
- Write landing page copy (free)
- Generate hero image (0.15 USDC)
- Create social cards (0.40 USDC)
- Generate preview video (0.50 USDC)

Total: ~$1.07. Professional agency would charge $3000+.

## FAQ

**Q: Is my USDC secure?**
A: Yes. Your private key stays on your machine. x402 never sees it. Transactions are signed locally and sent to the blockchain.

**Q: What if I run out of budget?**
A: Claude stops calling paid APIs. Free tools (writing, coding, analysis) still work. You can refill with one command.

**Q: Can I share my wallet with other users?**
A: Yes, but then they spend from your budget. For team/multi-user setups, each person should have their own wallet.

**Q: What if an API call fails?**
A: You're not charged. x402 only charges after the API successfully processes your request.

**Q: Can I use this with GPT-4 or other models?**
A: MCP is open standard. Any LLM provider can integrate it. OpenAI and others are working on support.

## Pricing

APIs on x402 are very cheap:

| Service | Price | Use Case |
|---------|-------|----------|
| Weather | 0.001 USDC | Lookup |
| Email check | 0.001 USDC | Validation |
| Web scrape | 0.01 USDC | Page scraping |
| Image generate | 0.15 USDC | 1024x1024 image |
| Video analyze | 0.25 USDC | 1-minute video |

A $10 budget gives you:
- 10,000 weather lookups
- 1,000 web scrapes
- 67 high-quality images
- 40 video analyses

## Get Started

```bash
# Install
npm install -g x402-bazaar

# Setup
npx x402-bazaar init

# Fund your wallet with USDC

# Update Claude Desktop config (add x402 MCP server)

# Restart Claude Desktop

# Start asking!
```

## Docs & Support

- **Setup guide:** [/docs/mcp-setup](/docs/mcp-setup)
- **API reference:** [/docs/apis](/docs/apis)
- **Troubleshooting:** [/docs/troubleshooting](/docs/troubleshooting)
- **GitHub:** [github.com/Wintyx57](https://github.com/Wintyx57)
- **Email:** x402bazaar@gmail.com

The future is AI agents with financial autonomy. Claude can now do what previously required hiring contractors, buying API subscriptions, and writing integration code.

Just ask. Claude handles the payment.
