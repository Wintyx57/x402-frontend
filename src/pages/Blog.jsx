import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export default function Blog() {
  const { t } = useTranslation();

  useEffect(() => { document.title = 'Blog | x402 Bazaar'; }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 no-underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.blog.backHome}
        </Link>

        {/* Article Header */}
        <article className="text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            Your AI Agent Just Got a Credit Card: Introducing x402 Bazaar
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-8 animate-fade-in-up delay-100">
            The first marketplace where AI agents discover, pay for, and consume APIs autonomously — using the HTTP status code the internet forgot.
          </p>

          <hr className="border-white/10 mb-8" />

          {/* Article Content */}
          <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
            <p>
              In 1997, the authors of the HTTP/1.1 specification reserved status code 402: "Payment Required." It was meant for a future where web browsers could make micropayments — a few cents for an article, a fraction of a penny for an API call, instant and frictionless.
            </p>

            <p>
              That future never arrived. There was no digital wallet in every browser. No universal payment protocol. No programmable money.
            </p>

            <p>
              So 402 sat unused for 29 years. Every developer learned it existed, and moved on.
            </p>

            <p>
              Today, we are launching <strong className="text-white">x402 Bazaar</strong> — the first autonomous AI-to-AI API marketplace — and HTTP 402 finally does what it was designed to do.
            </p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              The Problem: AI Agents Hit a Wall at the API Signup Page
            </h2>

            <p>
              AI agents are getting remarkably capable. They can reason, plan, write code, analyze data, and coordinate with other agents. But the moment they need external data — a web search, a weather forecast, a crypto price, a scraped webpage — they hit a wall.
            </p>

            <p>That wall is the API signup page.</p>

            <p>
              Every API an agent uses today was configured by a human. Someone created an account. Someone generated an API key. Someone set up billing. Someone wrote the integration code. Someone manages the rate limits and renewals.
            </p>

            <p>
              For one or two APIs, this is fine. But the trajectory of AI agents is clear: they need dynamic, on-demand access to <em>many</em> services. An agent working on a research task might need search, scraping, translation, summarization, and multiple data feeds — all in a single workflow. The specific services it needs depend on the task, and change from run to run.
            </p>

            <p>
              The human-configured model doesn't scale. Agents need the ability to discover, evaluate, pay for, and consume APIs on their own.
            </p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              The Solution: A Marketplace That Speaks HTTP 402
            </h2>

            <p>
              x402 Bazaar is an API marketplace built from the ground up for AI agents. Here is what makes it different from every API marketplace you have used before:
            </p>

            <p><strong className="text-white">Agents are the customers, not humans.</strong></p>

            <p>
              There are no signup forms, no API key dashboards, no billing portals. An agent interacts with x402 Bazaar entirely through HTTP. It discovers available services, checks prices, makes payments, and consumes data — all programmatically, all autonomously.
            </p>

            <p><strong className="text-white">Payments happen through the HTTP 402 protocol.</strong></p>

            <p>
              When an agent requests a paid endpoint, the server responds with <code className="bg-[#1a1f2e] px-2 py-0.5 rounded text-orange-400">402 Payment Required</code> and a JSON payload containing the price, the recipient wallet address, and the accepted payment chains. The agent transfers USDC (a stablecoin pegged to the US dollar) on-chain, then retries the original request with the transaction hash as proof of payment. The server verifies the transaction, marks the hash as used, and returns the requested data.
            </p>

            <p>This is exactly the flow HTTP 402 was designed for — just 29 years late.</p>

            <p><strong className="text-white">Micropayments that actually work.</strong></p>

            <p>
              x402 Bazaar supports payments on two chains: Base (Coinbase's L2, with sub-cent gas fees and ~2 second finality) and SKALE Europa (with literally zero gas fees). This means an API call can cost $0.005 and the agent pays exactly $0.005 — no gas overhead eating the payment. True micropayments, for the first time.
            </p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              How It Works: The Technical Flow
            </h2>

            <p>Let's walk through a real request. An AI agent wants to search the web for "latest AI research papers."</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Step 1: Discovery</h3>

            <p>The agent queries the x402 Bazaar catalog endpoint:</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`GET /api/services
Host: x402-api.onrender.com`}
              </pre>
            </div>

            <p>It receives a list of available services with descriptions, pricing, and endpoint details. It identifies a web search service priced at $0.01 per query.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Step 2: Request</h3>

            <p>The agent calls the search endpoint:</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`POST /api/services/search
Host: x402-api.onrender.com
Content-Type: application/json

{
  "query": "latest AI research papers 2026"
}`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Step 3: Payment Required</h3>

            <p>The server responds:</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "price": "0.01",
  "currency": "USDC",
  "recipient": "0x1234...abcd",
  "chains": ["base", "skale-europa"],
  "message": "Payment required to access this service"
}`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Step 4: On-Chain Payment</h3>

            <p>The agent transfers 0.01 USDC to the specified address on Base or SKALE Europa. It receives a transaction hash: <code className="bg-[#1a1f2e] px-2 py-0.5 rounded text-green-400">0xabcdef...</code>.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Step 5: Retry with Proof</h3>

            <p>The agent retries the original request with proof of payment:</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`POST /api/services/search
Host: x402-api.onrender.com
Content-Type: application/json
X-Payment-TxHash: 0xabcdef...

{
  "query": "latest AI research papers 2026"
}`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Step 6: Data Delivered</h3>

            <p>The server verifies the transaction on-chain, confirms the amount and recipient match, checks that the tx hash hasn't been used before (anti-replay), and returns the search results.</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "results": [
    {
      "title": "Scaling Autonomous Agents with Multi-Modal Reasoning",
      "url": "https://arxiv.org/abs/...",
      "snippet": "..."
    },
    ...
  ]
}`}
              </pre>
            </div>

            <p>The entire flow takes a few seconds. No human touched anything.</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              Security: Built for a Trustless Environment
            </h2>

            <p>When autonomous agents are making payments, security is not optional. Here is what we built:</p>

            <p>
              <strong className="text-white">Anti-replay protection.</strong> Every transaction hash is stored in Supabase after first use. If an agent (or attacker) tries to reuse a payment, the request is rejected. One payment, one service call. No exceptions.
            </p>

            <p>
              <strong className="text-white">USDC contract validation.</strong> The server verifies that the payment was made using the actual USDC contract on the expected chain — not a fake token with the same name. This prevents token substitution attacks where an attacker deploys a worthless ERC-20 named "USDC" and tries to pass it off as payment.
            </p>

            <p>
              <strong className="text-white">SSRF protection.</strong> The web scraping service validates and sanitizes URLs to prevent Server-Side Request Forgery attacks. Agents cannot use the scraper to probe internal networks or access restricted resources.
            </p>

            <p>
              <strong className="text-white">Economic spam prevention.</strong> Every API call costs real money. This is the simplest and most effective spam deterrent — if every request costs USDC, the cost of abuse scales linearly. No CAPTCHAs needed.
            </p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              What's in the Marketplace
            </h2>

            <p>x402 Bazaar launches with 70+ API services across multiple categories:</p>

            <p><strong className="text-white">6 Native Wrapper Services</strong> (built and maintained by x402 Bazaar, with standardized interfaces):</p>

            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-white/10 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#1a1f2e]">
                    <th className="border border-white/10 px-4 py-2 text-left text-white font-semibold">Service</th>
                    <th className="border border-white/10 px-4 py-2 text-left text-white font-semibold">Description</th>
                    <th className="border border-white/10 px-4 py-2 text-left text-white font-semibold">Example Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">Web Search</td>
                    <td className="border border-white/10 px-4 py-2">Search engine results</td>
                    <td className="border border-white/10 px-4 py-2">$0.01/query</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">Web Scraper</td>
                    <td className="border border-white/10 px-4 py-2">Fetch and parse web pages</td>
                    <td className="border border-white/10 px-4 py-2">$0.01/page</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">Twitter/X Data</td>
                    <td className="border border-white/10 px-4 py-2">Tweets, profiles, trends</td>
                    <td className="border border-white/10 px-4 py-2">$0.02/request</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">Weather</td>
                    <td className="border border-white/10 px-4 py-2">Current and forecast data</td>
                    <td className="border border-white/10 px-4 py-2">$0.005/query</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">Crypto Prices</td>
                    <td className="border border-white/10 px-4 py-2">Real-time market data</td>
                    <td className="border border-white/10 px-4 py-2">$0.005/query</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">Joke API</td>
                    <td className="border border-white/10 px-4 py-2">Random jokes (for fun)</td>
                    <td className="border border-white/10 px-4 py-2">$0.001/joke</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p><strong className="text-white">60+ Third-Party Services</strong> aggregated from external providers, all accessible through the same HTTP 402 payment flow.</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              MCP Integration: Plug Into Your AI Assistant
            </h2>

            <p>x402 Bazaar ships with a <strong className="text-white">Model Context Protocol (MCP) server</strong> that integrates directly with Claude Desktop, Cursor, and VS Code.</p>

            <p>Once connected, your AI assistant can:</p>

            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Browse the full marketplace catalog</li>
              <li>Compare prices across similar services</li>
              <li>Make USDC payments autonomously</li>
              <li>Return API results within the conversation</li>
            </ul>

            <p>This means you can have a conversation like:</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 my-4">
              <p className="mb-3">
                <strong className="text-white">You:</strong> <span className="text-gray-300">Find me Bitcoin's current price from three different data sources and compare them.</span>
              </p>
              <p>
                <strong className="text-white">Claude (via x402 Bazaar MCP):</strong> <span className="text-gray-300">I found three crypto price services in the marketplace. Let me query each one...</span>
              </p>
              <ul className="list-none ml-4 mt-2 space-y-1 text-gray-300">
                <li>- CoinGecko via x402: BTC = $98,432 (cost: $0.005)</li>
                <li>- CryptoCompare via x402: BTC = $98,445 (cost: $0.005)</li>
                <li>- Native crypto service: BTC = $98,438 (cost: $0.005)</li>
              </ul>
              <p className="mt-2 text-gray-300">All three sources agree within a $13 range. Total cost: $0.015.</p>
            </div>

            <p>The agent discovered the services, evaluated pricing, made three separate micropayments, and synthesized the results — all within a single conversational turn.</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              Get Started in One Command
            </h2>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">npx x402-bazaar init</pre>
            </div>

            <p>This single command:</p>

            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Creates a local x402 Bazaar client configuration</li>
              <li>Generates or imports a wallet for USDC payments</li>
              <li>Connects to the marketplace catalog</li>
              <li>Gives you (or your agent) immediate access to 70+ paid APIs</li>
            </ol>

            <p>From zero to your first paid API call in under a minute.</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              Built on Coinbase's x402 Standard
            </h2>

            <p>
              x402 Bazaar is built on the <strong className="text-white">x402 protocol</strong> — an open payment standard created by Coinbase that brings HTTP 402 to life. The protocol defines how servers advertise prices, how clients make payments, and how proof of payment is verified.
            </p>

            <p>
              We chose to build on x402 because it represents the right abstraction: payments as a native HTTP concern, not a bolt-on integration. When every API speaks the same payment protocol, agents can interact with any service without custom integration code.
            </p>

            <p>
              x402 Bazaar extends the protocol with a marketplace layer — service discovery, catalog management, wrapper services with standardized interfaces, and MCP integration for AI assistants.
            </p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              The Bigger Picture: Agent Commerce
            </h2>

            <p>
              We believe we are at the beginning of a fundamental shift in how software consumes services. Today, humans configure every API integration. Tomorrow, agents will handle it themselves — discovering what they need, evaluating options, paying for access, and moving on.
            </p>

            <p>This requires three things that did not exist together until now:</p>

            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong className="text-white">A payment protocol native to HTTP</strong> — x402 makes payments a standard HTTP interaction, not a separate system</li>
              <li><strong className="text-white">Programmable money with near-zero fees</strong> — USDC on L2s (Base, SKALE) makes micropayments viable for the first time</li>
              <li><strong className="text-white">AI agents capable of autonomous decision-making</strong> — modern LLM-based agents can evaluate, select, and use services without human guidance</li>
            </ol>

            <p>
              x402 Bazaar sits at the intersection of all three. It is the infrastructure layer for agent commerce — where agents discover services, pay with stablecoins, and get work done.
            </p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              Links
            </h2>

            <ul className="list-none space-y-2">
              <li>
                <strong className="text-white">Website:</strong>{' '}
                <a href="https://x402bazaar.org" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  x402bazaar.org
                </a>
              </li>
              <li>
                <strong className="text-white">GitHub (Frontend):</strong>{' '}
                <a href="https://github.com/Wintyx57/x402-frontend" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  github.com/Wintyx57/x402-frontend
                </a>
              </li>
              <li>
                <strong className="text-white">GitHub (Backend):</strong>{' '}
                <a href="https://github.com/Wintyx57/x402-backend" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  github.com/Wintyx57/x402-backend
                </a>
              </li>
              <li>
                <strong className="text-white">API:</strong>{' '}
                <a href="https://x402-api.onrender.com" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  x402-api.onrender.com
                </a>
              </li>
              <li>
                <strong className="text-white">Coinbase x402 Protocol:</strong>{' '}
                <a href="https://www.x402.org/" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  x402.org
                </a>
              </li>
              <li>
                <strong className="text-white">Hackathon:</strong> SF Agentic Commerce x402 on DoraHacks (Feb 11-13, 2026)
              </li>
            </ul>

            <hr className="border-white/5 my-8" />

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
              Try It Now
            </h2>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">npx x402-bazaar init</pre>
            </div>

            <p className="text-lg">
              HTTP 402 waited 29 years for this. Your agent doesn't have to wait another minute.
            </p>

            <hr className="border-white/5 my-8" />

            <p className="text-sm text-gray-500 italic">
              x402 Bazaar is an independent project built on the open x402 protocol standard. It is not affiliated with or endorsed by Coinbase.
            </p>
          </div>

          {/* CTA Section */}
          <div className="mt-12 p-6 bg-[#FF9900]/[0.06] border border-[#FF9900]/20 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-3">Ready to start?</h3>
            <p className="text-gray-400 text-sm mb-4">
              One command to connect your AI agent: <code className="bg-[#1a1f2e] px-2 py-1 rounded text-[#FF9900]">npx x402-bazaar init</code>
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/services"
                className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all"
              >
                Explore Services
              </Link>
              <Link
                to="/developers"
                className="glass text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:border-white/20 transition-all"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
