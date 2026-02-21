interface Props { d: Record<string, string>; }

import { Link } from 'react-router-dom';
import { DocsCodeBlock } from './shared';

export default function IntegrationSection({ d }: Props) {
  return (
    <section id="integration">
      <h2 className="text-2xl font-bold text-white mb-3">{d.integrationTitle || 'Integration'}</h2>
      <p className="text-gray-400 text-sm mb-6">{d.integrationDesc || ''}</p>

      <h3 className="text-white font-semibold mb-3">{d.integrationJs || 'JavaScript (Node.js)'}</h3>
      <DocsCodeBlock code={`async function payAndRequest(url, wallet, options = {}) {
  const res = await fetch(url, options);
  const body = await res.json();
  if (res.status !== 402) return body;

  const { amount, recipient } = body.payment_details;
  const transfer = await wallet.createTransfer({
    amount, assetId: 'usdc', destination: recipient,
  });
  const confirmed = await transfer.wait();
  const txHash = confirmed.getTransactionHash();

  const retryRes = await fetch(url, {
    ...options,
    headers: { ...options.headers, 'X-Payment-TxHash': txHash },
  });
  return retryRes.json();
}`} />

      <h3 className="text-white font-semibold mt-6 mb-3">{d.integrationPy || 'Python (requests + web3)'}</h3>
      <DocsCodeBlock code={`import requests

BAZAAR = "https://x402-api.onrender.com"

def pay_and_request(url, wallet_key):
    res = requests.get(url)
    if res.status_code != 402:
        return res.json()

    details = res.json()["payment_details"]
    # Send USDC to details["recipient"] on Base
    tx_hash = send_usdc(details["recipient"], details["amount"], wallet_key)

    return requests.get(url, headers={
        "X-Payment-TxHash": tx_hash
    }).json()

# Usage
data = pay_and_request(f"{BAZAAR}/api/weather?city=Paris", KEY)`} />

      <div className="mt-4">
        <Link to="/integrate" className="text-[#FF9900] hover:text-[#FFB84D] text-sm font-medium no-underline inline-flex items-center gap-1">
          {d.integrationFullDoc || 'Full integration guide'} →
        </Link>
      </div>
    </section>
  );
}
