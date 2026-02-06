import { API_URL } from '../config';

export default function Developers() {
  const baseUrl = API_URL === 'http://localhost:3000' ? 'https://x402-api.onrender.com' : API_URL;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Developer Documentation</h1>
      <p className="text-gray-500 mb-8">
        Integrate x402 Bazaar into your AI agent in minutes.
      </p>

      {/* Protocol */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">The x402 Protocol</h2>
        <div className="bg-[#12121a] border border-gray-800 rounded-xl p-5 text-sm text-gray-300 space-y-3">
          <p><strong className="text-white">1.</strong> Call any paid endpoint without payment headers.</p>
          <p><strong className="text-white">2.</strong> Server responds <code className="bg-gray-800 px-1.5 py-0.5 rounded text-orange-400">HTTP 402</code> with payment details (amount, recipient, network).</p>
          <p><strong className="text-white">3.</strong> Your agent sends USDC to the recipient on Base.</p>
          <p><strong className="text-white">4.</strong> Resend the same request with header <code className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400">X-Payment-TxHash: 0x...</code></p>
          <p><strong className="text-white">5.</strong> Server verifies the tx on-chain and grants access.</p>
        </div>
      </section>

      {/* Endpoints */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">API Endpoints</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="pb-3 pr-4">Route</th>
                <th className="pb-3 pr-4">Method</th>
                <th className="pb-3 pr-4">Cost</th>
                <th className="pb-3">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-blue-400">/</td>
                <td className="py-3 pr-4">GET</td>
                <td className="py-3 pr-4 text-green-400">Free</td>
                <td className="py-3">Discovery: marketplace info + endpoints</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-blue-400">/services</td>
                <td className="py-3 pr-4">GET</td>
                <td className="py-3 pr-4 text-yellow-400">0.05 USDC</td>
                <td className="py-3">List all registered services</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 font-mono text-blue-400">/search?q=</td>
                <td className="py-3 pr-4">GET</td>
                <td className="py-3 pr-4 text-yellow-400">0.05 USDC</td>
                <td className="py-3">Search services by keyword</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-blue-400">/register</td>
                <td className="py-3 pr-4">POST</td>
                <td className="py-3 pr-4 text-yellow-400">1.00 USDC</td>
                <td className="py-3">Register a new service</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Example */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Quick Example</h2>
        <pre className="bg-[#12121a] border border-gray-800 rounded-xl p-5 text-sm text-gray-300 overflow-x-auto">
{`# 1. Discover the marketplace
curl ${baseUrl}/

# 2. Try to search (will get 402)
curl ${baseUrl}/search?q=weather
# → HTTP 402 + payment_details

# 3. Pay USDC on Base (via your wallet/SDK)
# ... send 0.05 USDC to the recipient address

# 4. Retry with proof of payment
curl -H "X-Payment-TxHash: 0xabc123..." \\
  ${baseUrl}/search?q=weather
# → HTTP 200 + results`}
        </pre>
      </section>

      {/* Register body */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">POST /register Body</h2>
        <pre className="bg-[#12121a] border border-gray-800 rounded-xl p-5 text-sm text-gray-300 overflow-x-auto">
{`{
  "name": "My AI Service",
  "description": "What my service does",
  "url": "https://api.myservice.com/v1",
  "price": 0.10,
  "tags": ["ai", "nlp"],
  "ownerAddress": "0xYourWalletAddress"
}`}
        </pre>
      </section>

      {/* 402 Response */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">402 Response Format</h2>
        <pre className="bg-[#12121a] border border-gray-800 rounded-xl p-5 text-sm text-gray-300 overflow-x-auto">
{`{
  "error": "Payment Required",
  "payment_details": {
    "amount": 0.05,
    "currency": "USDC",
    "network": "base",
    "chainId": 8453,
    "recipient": "0xServerWallet...",
    "action": "Search services"
  }
}`}
        </pre>
      </section>
    </div>
  );
}
