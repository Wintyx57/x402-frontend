---
title: "How to Monetize Your API in 5 Minutes with HTTP 402"
date: 2026-02-28
author: x402 Team
tags:
  - monetization
  - api-creators
  - http-402
  - fastapi
  - tutorials
---

# How to Monetize Your API in 5 Minutes with HTTP 402

You built something valuable. Maybe it's a machine learning model that generates custom images. Maybe it's a web scraper that aggregates real estate listings. Maybe it's a code sandbox that runs arbitrary Python safely.

You want to monetize it. But the traditional path is painful:

1. Set up Stripe ($5k+ setup cost, 2.9% + $0.30 per transaction)
2. Build a billing dashboard (custom code, debugging, refunds)
3. Implement API key management (database, token rotation)
4. Handle disputes, chargebacks, fraud (legal team, lost revenue)
5. Wait 1-3 days for payments to settle

Most API creators give up and keep it free.

There's a better way: **HTTP 402 Payment Required**.

## The x402 Solution

At x402 Bazaar, we handle all that complexity. You focus on your API. We handle payments, wallets, on-chain settlement, and compliance.

Here's what you get:

- **Zero setup** — No Stripe integration, no paperwork
- **Instant settlement** — USDC paid directly to your wallet
- **Automatic billing** — Clients pay per call, no invoices
- **Global reach** — Accept payments from AI agents worldwide
- **95% revenue share** — You keep 95% of every payment
- **Real-time metrics** — Dashboard shows revenue, API calls, popular endpoints

## The x402_paywall Decorator (For FastAPI)

We provide a Python decorator that handles everything:

```python
from fastapi import FastAPI
from x402_fastapi import x402_paywall

app = FastAPI()

@app.get("/api/imagine")
@x402_paywall(
    price_usdc=0.10,
    description="Generate image from text prompt"
)
async def imagine(prompt: str):
    """
    Generate a custom image using Stable Diffusion.
    Costs 0.10 USDC per request.
    """
    # Your code here
    image_url = run_stable_diffusion(prompt)
    return {"image_url": image_url}
```

That's it. The decorator:
1. Checks the incoming request for a payment proof
2. If no payment, responds with 402 + payment instructions
3. If payment exists, verifies it on-chain
4. If valid, processes the request and charges the client's wallet
5. Logs the call to your dashboard
6. Deposits USDC to your wallet (minus 5% fee)

No backend engineering required. No database. No authentication system.

## Step-by-Step Tutorial

### Step 1: Create a FastAPI App

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

# Your custom service (example: web scraping)
def scrape_prices(url: str) -> dict:
    # Your scraping logic
    return {
        "url": url,
        "products": [
            {"name": "Widget", "price": 19.99},
            {"name": "Gadget", "price": 29.99}
        ]
    }

@app.get("/scrape")
async def scrape_endpoint(url: str):
    return scrape_prices(url)
```

### Step 2: Add x402_paywall

```python
from fastapi import FastAPI
from x402_fastapi import x402_paywall

app = FastAPI()

def scrape_prices(url: str) -> dict:
    return {
        "url": url,
        "products": [
            {"name": "Widget", "price": 19.99},
            {"name": "Gadget", "price": 29.99}
        ]
    }

@app.get("/scrape")
@x402_paywall(
    price_usdc=0.05,  # 5 cents per call
    description="Scrape product prices from e-commerce site"
)
async def scrape_endpoint(url: str):
    return scrape_prices(url)
```

### Step 3: Set Your Wallet Address

```bash
export X402_WALLET="0x742d35Cc6634C0532925a3b844Bc9e7595f..." # Your wallet
export X402_CHAIN="base"  # or "skale"
```

### Step 4: Deploy

```bash
# Use any hosting (Render, Railway, Heroku, AWS Lambda)
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Step 5: Register at x402 Bazaar

Go to [x402bazaar.org/register](/register) and submit your endpoint:
- Name: "Price Scraper"
- Endpoint: `https://your-app.com/scrape`
- Price: 0.05 USDC
- Category: "Web Scraping"
- Description: "Extract product prices from any e-commerce site"

Within minutes, your API is live on the x402 marketplace. AI agents can start using it.

## Multiple Endpoints, Multiple Prices

You can have many endpoints with different prices:

```python
@app.post("/generate-image")
@x402_paywall(price_usdc=0.15)
async def generate_image(prompt: str):
    # Image generation is expensive
    return {"image_url": generate_image_ml(prompt)}

@app.get("/validate-email")
@x402_paywall(price_usdc=0.001)
async def validate_email(email: str):
    # Email validation is cheap
    return {"valid": check_email(email)}

@app.post("/summarize")
@x402_paywall(price_usdc=0.05)
async def summarize(text: str):
    # Text summarization is mid-tier
    return {"summary": ai_summarize(text)}
```

Your dashboard shows metrics per endpoint:
- Calls this month
- Revenue this month
- Most popular endpoints
- Revenue trends

## Revenue Model: Simple Math

Let's say you launch a text-to-image API priced at 0.10 USDC:

- **100 calls/month** = 10 USDC
- **x402 fee** (5%) = 0.50 USDC
- **You receive** = 9.50 USDC

Payments settle automatically every hour. USDC lands in your wallet. No delays, no disputes.

If demand grows:
- **10,000 calls/month** = 1,000 USDC
- **x402 fee** = 50 USDC
- **You receive** = 950 USDC (monthly recurring income)

## Advanced: Tiered Pricing

Need different prices for different clients? Use request context:

```python
@app.get("/api/data")
@x402_paywall(
    price_usdc=0.10,  # default
    premium_price_usdc=0.05  # if client has premium token
)
async def get_data(request: Request):
    # Check if client is premium
    is_premium = check_premium_status(request)
    return {"data": fetch_data(), "premium": is_premium}
```

## Rate Limiting & Quotas

Prevent abuse with built-in rate limiting:

```python
@app.get("/api/search")
@x402_paywall(
    price_usdc=0.01,
    rate_limit_per_minute=100,
    rate_limit_per_day=10000
)
async def search(query: str):
    return perform_search(query)
```

If a client hits the daily limit, they get an error with clear messaging.

## Monitoring & Analytics

Your dashboard shows:
- **Revenue by endpoint** — Which services earn most?
- **Client activity** — Who's using your APIs most?
- **Performance metrics** — Response times, error rates
- **Payment history** — Every USDC received, dates, times
- **Payout schedule** — When and how much you're earning

## Real Examples at x402 Bazaar

Creators are already monetizing:

1. **Image Generation** — 0.15 USDC per image (1,200 calls/month)
2. **Weather Data** — 0.001 USDC per lookup (50,000 calls/month)
3. **Code Execution** — 0.05 USDC per run (500 calls/month)
4. **Web Scraping** — 0.02 USDC per page (8,000 calls/month)
5. **Data Analysis** — 0.25 USDC per analysis (300 calls/month)

The most successful APIs aren't the most expensive. They're the ones solving real problems.

## Compared to Alternatives

| Feature | x402 | Stripe | AWS API Gateway |
|---------|------|--------|-----------------|
| Setup time | 5 min | 2 days | 2 hours |
| Transaction fee | 5% | 2.9% + $0.30 | 3.5% |
| Settlement time | Instant | 1-3 days | Daily |
| Global payouts | Yes | Limited | Limited |
| No login required | Yes | No | No |
| Works with agents | Yes | No | No |

## Get Started

1. **Clone the template:** `git clone https://github.com/Wintyx57/x402-fast-monetization-template`
2. **Add your logic** (replace the example endpoint)
3. **Deploy** (Render, Railway, any host)
4. **Register** at [x402bazaar.org/register](/register)
5. **Start earning** (payments in your wallet within minutes)

## Questions?

- **Full template docs:** [/docs/fastapi-template](/docs/fastapi-template)
- **API reference:** [/docs/api](/docs/api)
- **Creator community:** [/community](/community)
- **Email:** x402bazaar@gmail.com

Your API is valuable. Stop giving it away for free. Join 74 creators earning USDC on x402 Bazaar today.
