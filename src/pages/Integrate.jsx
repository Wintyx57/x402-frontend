import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs font-medium text-[#FF9900]/80 bg-[#FF9900]/10 px-2 py-0.5 rounded">
          {lang || 'Code'}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-3 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

export default function Integrate() {
  const { t } = useTranslation();
  const whyRef = useReveal();
  const flowRef = useReveal();
  const coreRef = useReveal();
  const agentRef = useReveal();
  const pythonRef = useReveal();
  const useCasesRef = useReveal();
  const startRef = useReveal();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-fade-in-up">
        {t.integrate.title}
      </h1>
      <p className="text-gray-400 mb-12 max-w-2xl animate-fade-in-up delay-100">
        {t.integrate.subtitle}
      </p>

      {/* Why Integrate */}
      <section ref={whyRef} className="reveal mb-14">
        <h2 className="text-2xl font-bold text-white mb-6">{t.integrate.whyTitle}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5 transition-all duration-200 hover:glow-orange">
            <div className="w-10 h-10 glass text-[#FF9900] rounded-full flex items-center justify-center
                            text-lg mb-3 border border-[#FF9900]/30">$</div>
            <h3 className="text-white font-semibold mb-1">{t.integrate.why1Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.why1Desc}</p>
          </div>
          <div className="glass rounded-xl p-5 transition-all duration-200 hover:glow-orange">
            <div className="w-10 h-10 glass text-[#FF9900] rounded-full flex items-center justify-center
                            text-lg mb-3 border border-[#FF9900]/30">?</div>
            <h3 className="text-white font-semibold mb-1">{t.integrate.why2Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.why2Desc}</p>
          </div>
          <div className="glass rounded-xl p-5 transition-all duration-200 hover:glow-orange">
            <div className="w-10 h-10 glass text-[#FF9900] rounded-full flex items-center justify-center
                            text-lg mb-3 border border-[#FF9900]/30">&#x2713;</div>
            <h3 className="text-white font-semibold mb-1">{t.integrate.why3Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.why3Desc}</p>
          </div>
        </div>
      </section>

      {/* Agent Flow */}
      <section ref={flowRef} className="reveal mb-14">
        <h2 className="text-2xl font-bold text-white mb-6">{t.integrate.flowTitle}</h2>
        <div className="space-y-4">
          {[
            { title: t.integrate.flowStep1Title, desc: t.integrate.flowStep1Desc, code: t.integrate.flowStep1Code },
            { title: t.integrate.flowStep2Title, desc: t.integrate.flowStep2Desc, code: t.integrate.flowStep2Code },
            { title: t.integrate.flowStep3Title, desc: t.integrate.flowStep3Desc, code: t.integrate.flowStep3Code },
            { title: t.integrate.flowStep4Title, desc: t.integrate.flowStep4Desc, code: t.integrate.flowStep4Code },
          ].map(({ title, desc, code }) => (
            <div key={title} className="glass rounded-xl p-5">
              <h3 className="text-[#FF9900] font-bold mb-1">{title}</h3>
              <p className="text-gray-400 text-sm mb-3">{desc}</p>
              <CodeBlock code={code} />
            </div>
          ))}
        </div>
      </section>

      {/* Core Pattern */}
      <section ref={coreRef} className="reveal mb-14">
        <h2 className="text-2xl font-bold text-white mb-2">{t.integrate.corePatternTitle}</h2>
        <p className="text-gray-400 text-sm mb-4">{t.integrate.corePatternDesc}</p>
        <CodeBlock lang="JavaScript" code={`async function payAndRequest(url, wallet, options = {}) {
  // 1. Make the request
  const res = await fetch(url, options);
  const body = await res.json();

  // 2. If not 402, return directly
  if (res.status !== 402) return body;

  // 3. HTTP 402 — extract payment details
  const { amount, recipient } = body.payment_details;

  // 4. Pay USDC on Base
  const transfer = await wallet.createTransfer({
    amount,
    assetId: 'usdc',
    destination: recipient,
  });
  const confirmed = await transfer.wait();
  const txHash = confirmed.getTransactionHash();

  // 5. Retry with proof of payment
  const retryRes = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Payment-TxHash': txHash,
    },
  });
  return retryRes.json();
}`} />
      </section>

      {/* Full Agent Example */}
      <section ref={agentRef} className="reveal mb-14">
        <h2 className="text-2xl font-bold text-white mb-2">{t.integrate.agentExampleTitle}</h2>
        <p className="text-gray-400 text-sm mb-4">{t.integrate.agentExampleDesc}</p>
        <CodeBlock lang="JavaScript" code={`import OpenAI from 'openai';
import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';

const BAZAAR = 'https://x402-api.onrender.com';
const openai = new OpenAI();

// --- Setup wallet ---
Coinbase.configure({ apiKeyName: API_KEY, privateKey: SECRET });
const wallet = await Wallet.create({ networkId: 'base-sepolia' });

// --- Define tools for the LLM ---
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_services',
      description: 'Search x402 Bazaar for services. Costs 0.05 USDC.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'call_api',
      description: 'Call an external API URL and return the result.',
      parameters: {
        type: 'object',
        properties: { url: { type: 'string' } },
        required: ['url'],
      },
    },
  },
];

// --- Tool execution with auto-payment ---
async function executeTool(name, args) {
  if (name === 'search_services') {
    return payAndRequest(
      \`\${BAZAAR}/search?q=\${args.query}\`, wallet
    );
  }
  if (name === 'call_api') {
    const res = await fetch(args.url);
    return res.json();
  }
}

// --- Agent loop ---
const messages = [
  { role: 'system', content: 'You are an autonomous agent on x402 Bazaar...' },
  { role: 'user', content: 'Find the weather in Paris and BTC price' },
];

for (let turn = 0; turn < 10; turn++) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini', messages, tools,
  });
  const msg = res.choices[0].message;
  messages.push(msg);

  if (!msg.tool_calls) break; // Agent is done

  for (const call of msg.tool_calls) {
    const result = await executeTool(
      call.function.name,
      JSON.parse(call.function.arguments)
    );
    messages.push({
      role: 'tool',
      tool_call_id: call.id,
      content: JSON.stringify(result),
    });
  }
}

console.log(messages.at(-1).content); // Final answer`} />
        <p className="text-gray-500 text-xs mt-3">
          {t.integrate.agentExampleNote}{' '}
          <a
            href="https://github.com/Wintyx57/x402-backend"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-text no-underline"
          >
            GitHub
          </a>.
        </p>
      </section>

      {/* Python Example */}
      <section ref={pythonRef} className="reveal mb-14">
        <h2 className="text-2xl font-bold text-white mb-2">{t.integrate.pythonTitle}</h2>
        <p className="text-gray-400 text-sm mb-4">{t.integrate.pythonDesc}</p>
        <CodeBlock lang="Python" code={`import requests
from web3 import Web3

BAZAAR = "https://x402-api.onrender.com"
w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))

def pay_and_request(url, wallet_key, **kwargs):
    """Handle the full x402 payment flow."""
    res = requests.get(url, **kwargs)

    if res.status_code != 402:
        return res.json()

    # Extract payment details
    details = res.json()["payment_details"]

    # Build USDC transfer transaction
    usdc = w3.eth.contract(
        address="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        abi=[{  # transfer(address,uint256)
            "name": "transfer", "type": "function",
            "inputs": [
                {"name": "to", "type": "address"},
                {"name": "amount", "type": "uint256"}
            ],
            "outputs": [{"type": "bool"}]
        }]
    )

    amount_raw = int(details["amount"] * 1e6)
    tx = usdc.functions.transfer(
        details["recipient"], amount_raw
    ).build_transaction({
        "from": w3.eth.account.from_key(wallet_key).address,
        "nonce": w3.eth.get_transaction_count(
            w3.eth.account.from_key(wallet_key).address
        ),
    })

    signed = w3.eth.account.sign_transaction(tx, wallet_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    w3.eth.wait_for_transaction_receipt(tx_hash)

    # Retry with proof
    return requests.get(url, headers={
        "X-Payment-TxHash": tx_hash.hex()
    }).json()

# Usage
services = pay_and_request(
    f"{BAZAAR}/search?q=weather",
    wallet_key="0xYOUR_PRIVATE_KEY"
)
print(services)`} />
      </section>

      {/* Use Cases */}
      <section ref={useCasesRef} className="reveal mb-14">
        <h2 className="text-2xl font-bold text-white mb-6">{t.integrate.useCasesTitle}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5 transition-all duration-300 hover:glow-orange">
            <h3 className="text-white font-semibold mb-2">{t.integrate.useCase1Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.useCase1Desc}</p>
          </div>
          <div className="glass rounded-xl p-5 transition-all duration-300 hover:glow-orange">
            <h3 className="text-white font-semibold mb-2">{t.integrate.useCase2Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.useCase2Desc}</p>
          </div>
          <div className="glass rounded-xl p-5 transition-all duration-300 hover:glow-orange">
            <h3 className="text-white font-semibold mb-2">{t.integrate.useCase3Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.useCase3Desc}</p>
          </div>
        </div>
      </section>

      {/* Provider Side */}
      <section className="mb-14">
        <div className="glass rounded-xl p-6 sm:p-8 border border-[#FF9900]/10">
          <h2 className="text-2xl font-bold text-white mb-2">{t.integrate.providerTitle}</h2>
          <p className="text-gray-400 text-sm mb-5 max-w-lg">
            {t.integrate.providerDesc}
          </p>
          <div className="bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden mb-5">
            <div className="flex items-center px-4 py-2 border-b border-white/10">
              <span className="text-xs font-medium text-[#FF9900]/80 bg-[#FF9900]/10 px-2 py-0.5 rounded">Python</span>
            </div>
            <pre className="px-4 py-3 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">{`@x402_paywall(price=0.05, description="My paid endpoint")
def my_function(query: str) -> dict:
    return {"result": process(query)}`}</pre>
          </div>
          <a
            href="https://github.com/Wintyx57/x402-fast-monetization-template"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-btn text-white px-5 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {t.integrate.providerBtn}
          </a>
        </div>
      </section>

      {/* Get Started */}
      <section ref={startRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">{t.integrate.getStartedTitle}</h2>

        {/* Quick Start with CLI */}
        <div className="rounded-xl border-2 border-[#FF9900]/30 bg-gradient-to-br from-[#FF9900]/[0.06] to-transparent p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full">{t.integrate.recommended}</span>
          </div>
          <h3 className="text-white font-bold mb-2">{t.integrate.quickStartCliTitle}</h3>
          <p className="text-gray-400 text-sm mb-4">{t.integrate.quickStartCliDesc}</p>
          <CodeBlock lang="Shell" code="npx x402-bazaar init" />
          <p className="text-gray-500 text-xs mt-3">{t.integrate.quickStartCliNote}</p>
        </div>

        {/* Manual alternative */}
        <div className="glass rounded-xl p-5 mb-8">
          <h3 className="text-white font-semibold mb-2">{t.integrate.manualTitle}</h3>
          <p className="text-gray-400 text-sm mb-4">{t.integrate.manualDesc}</p>
          <CodeBlock lang="Shell" code={`# ${t.integrate.getStartedStep1}
git clone https://github.com/Wintyx57/x402-backend.git
cd x402-backend

# ${t.integrate.getStartedStep2}
npm install

# ${t.integrate.getStartedStep3}
cp .env.example .env
# Edit .env with your Coinbase API keys + OpenAI key

# ${t.integrate.getStartedStep4}
npm run demo`} />
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/services"
            className="gradient-btn text-white px-6 py-3 rounded-xl font-medium no-underline
                       transition-all duration-300 hover:scale-105 hover:glow-orange"
          >
            {t.integrate.browseServices}
          </Link>
          <Link
            to="/mcp"
            className="glass text-gray-300 px-6 py-3 rounded-xl font-medium no-underline
                       transition-all duration-300 hover:scale-105 hover:border-white/20"
          >
            MCP Server
          </Link>
          <Link
            to="/developers"
            className="glass text-gray-300 px-6 py-3 rounded-xl font-medium no-underline
                       transition-all duration-300 hover:scale-105 hover:border-white/20"
          >
            API Docs
          </Link>
        </div>
      </section>
    </div>
  );
}
