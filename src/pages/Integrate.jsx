import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';

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
        <h2 className="text-xl font-bold text-white mb-6">{t.integrate.whyTitle}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 transition-all duration-300 hover:glow-blue">
            <div className="w-10 h-10 glass text-blue-400 rounded-full flex items-center justify-center
                            text-lg mb-3 ring-2 ring-blue-400/30">$</div>
            <h3 className="text-white font-semibold mb-1">{t.integrate.why1Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.why1Desc}</p>
          </div>
          <div className="glass rounded-2xl p-5 transition-all duration-300 hover:glow-green">
            <div className="w-10 h-10 glass text-green-400 rounded-full flex items-center justify-center
                            text-lg mb-3 ring-2 ring-green-400/30">?</div>
            <h3 className="text-white font-semibold mb-1">{t.integrate.why2Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.why2Desc}</p>
          </div>
          <div className="glass rounded-2xl p-5 transition-all duration-300 hover:glow-purple">
            <div className="w-10 h-10 glass text-purple-400 rounded-full flex items-center justify-center
                            text-lg mb-3 ring-2 ring-purple-400/30">&#x2713;</div>
            <h3 className="text-white font-semibold mb-1">{t.integrate.why3Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.why3Desc}</p>
          </div>
        </div>
      </section>

      {/* Agent Flow */}
      <section ref={flowRef} className="reveal mb-14">
        <h2 className="text-xl font-bold text-white mb-6">{t.integrate.flowTitle}</h2>
        <div className="space-y-4">
          {[
            { title: t.integrate.flowStep1Title, desc: t.integrate.flowStep1Desc, code: t.integrate.flowStep1Code, color: 'blue' },
            { title: t.integrate.flowStep2Title, desc: t.integrate.flowStep2Desc, code: t.integrate.flowStep2Code, color: 'orange' },
            { title: t.integrate.flowStep3Title, desc: t.integrate.flowStep3Desc, code: t.integrate.flowStep3Code, color: 'green' },
            { title: t.integrate.flowStep4Title, desc: t.integrate.flowStep4Desc, code: t.integrate.flowStep4Code, color: 'purple' },
          ].map(({ title, desc, code, color }) => (
            <div key={title} className="glass rounded-2xl p-5">
              <h3 className={`text-${color}-400 font-bold mb-1`}>{title}</h3>
              <p className="text-gray-400 text-sm mb-3">{desc}</p>
              <pre className="glass rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-300 overflow-x-auto">
                {code}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Core Pattern */}
      <section ref={coreRef} className="reveal mb-14">
        <h2 className="text-xl font-bold text-white mb-2">{t.integrate.corePatternTitle}</h2>
        <p className="text-gray-400 text-sm mb-4">{t.integrate.corePatternDesc}</p>
        <pre className="glass rounded-2xl p-5 text-xs sm:text-sm text-gray-300 overflow-x-auto leading-relaxed">
{`async function payAndRequest(url, wallet, options = {}) {
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
}`}
        </pre>
      </section>

      {/* Full Agent Example */}
      <section ref={agentRef} className="reveal mb-14">
        <h2 className="text-xl font-bold text-white mb-2">{t.integrate.agentExampleTitle}</h2>
        <p className="text-gray-400 text-sm mb-4">{t.integrate.agentExampleDesc}</p>
        <pre className="glass rounded-2xl p-5 text-xs sm:text-sm text-gray-300 overflow-x-auto leading-relaxed">
{`import OpenAI from 'openai';
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

console.log(messages.at(-1).content); // Final answer`}
        </pre>
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
        <h2 className="text-xl font-bold text-white mb-2">{t.integrate.pythonTitle}</h2>
        <p className="text-gray-400 text-sm mb-4">{t.integrate.pythonDesc}</p>
        <pre className="glass rounded-2xl p-5 text-xs sm:text-sm text-gray-300 overflow-x-auto leading-relaxed">
{`import requests
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
print(services)`}
        </pre>
      </section>

      {/* Use Cases */}
      <section ref={useCasesRef} className="reveal mb-14">
        <h2 className="text-xl font-bold text-white mb-6">{t.integrate.useCasesTitle}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 transition-all duration-300 hover:glow-blue">
            <h3 className="text-white font-semibold mb-2">{t.integrate.useCase1Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.useCase1Desc}</p>
          </div>
          <div className="glass rounded-2xl p-5 transition-all duration-300 hover:glow-green">
            <h3 className="text-white font-semibold mb-2">{t.integrate.useCase2Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.useCase2Desc}</p>
          </div>
          <div className="glass rounded-2xl p-5 transition-all duration-300 hover:glow-purple">
            <h3 className="text-white font-semibold mb-2">{t.integrate.useCase3Title}</h3>
            <p className="text-gray-500 text-sm">{t.integrate.useCase3Desc}</p>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section ref={startRef} className="reveal mb-10">
        <h2 className="text-xl font-bold text-white mb-2">{t.integrate.getStartedTitle}</h2>
        <p className="text-gray-400 text-sm mb-4">{t.integrate.getStartedDesc}</p>
        <pre className="glass rounded-2xl p-5 text-xs sm:text-sm text-gray-300 overflow-x-auto leading-relaxed">
{`# ${t.integrate.getStartedStep1}
git clone https://github.com/Wintyx57/x402-backend.git
cd x402-backend

# ${t.integrate.getStartedStep2}
npm install

# ${t.integrate.getStartedStep3}
cp .env.example .env
# Edit .env with your Coinbase API keys + OpenAI key

# ${t.integrate.getStartedStep4}
npm run demo`}
        </pre>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link
            to="/services"
            className="gradient-btn text-white px-6 py-3 rounded-xl font-medium no-underline
                       transition-all duration-300 hover:scale-105 hover:glow-blue"
          >
            {t.home.browseServices}
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
