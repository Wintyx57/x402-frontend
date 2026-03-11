import { useState, useMemo } from 'react';
import { TrailsWidget } from '0xtrails/widget';
import { TRAILS_ROUTER_PLACEHOLDER_AMOUNT } from '0xtrails';
import { useAccount } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import useSEO from '../hooks/useSEO';
import { useReveal } from '../hooks/useReveal';

const TRAILS_API_KEY = import.meta.env.VITE_TRAILS_API_KEY || '';

// Base Mainnet USDC
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// SKALE IMA Bridge DepositBoxERC20 on Base
const DEPOSIT_BOX_ERC20_ADDRESS = '0x7f54e52D08C911eAbB4fDF00Ad36ccf07F867F61' as const;

// SKALE Chain name for SKALE on Base
const SKALE_CHAIN_NAME = 'winged-bubbly-grumium';

const depositBoxErc20Abi = [
  {
    type: 'function' as const,
    name: 'depositERC20Direct' as const,
    stateMutability: 'nonpayable' as const,
    inputs: [
      { name: 'schainName', type: 'string' as const },
      { name: 'erc20OnMainnet', type: 'address' as const },
      { name: 'amount', type: 'uint256' as const },
      { name: 'receiver', type: 'address' as const },
    ],
    outputs: [],
  },
] as const;

export default function FundWallet() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [bridgeComplete, setBridgeComplete] = useState(false);
  const [bridgeSessionId, setBridgeSessionId] = useState<string | null>(null);
  const [bridgedAmount, setBridgedAmount] = useState<string | null>(null);

  const f = t.fund || {} as Record<string, string>;

  useSEO({
    title: f.pageTitle || 'Fund Your Wallet — Bridge USDC to SKALE',
    description: f.pageDescription || 'Bridge USDC from any chain to SKALE on Base in 1 click. Pay for APIs with ultra-low gas.',
    keywords: 'bridge USDC, cross-chain, fund wallet, x402, SKALE',
  });

  const heroRef = useReveal();
  const widgetRef = useReveal();
  const howRef = useReveal();

  const actualRecipient = (recipient || address || '') as `0x${string}`;
  const isValidRecipient = actualRecipient && actualRecipient.startsWith('0x') && actualRecipient.length === 42;

  const isDark = theme === 'dark';

  // Encode depositERC20Direct calldata with placeholder amount
  // Trails replaces the placeholder with the actual amount at runtime
  const bridgeCalldata = useMemo(() => {
    if (!isValidRecipient) return undefined;

    return encodeFunctionData({
      abi: depositBoxErc20Abi,
      functionName: 'depositERC20Direct',
      args: [
        SKALE_CHAIN_NAME,
        USDC_BASE_ADDRESS,
        TRAILS_ROUTER_PLACEHOLDER_AMOUNT, // Auto-filled at runtime
        actualRecipient,
      ],
    });
  }, [actualRecipient, isValidRecipient]);

  const widgetCss = isDark
    ? `--trails-border-radius-button: 12px;
       --trails-border-radius-card: 16px;
       --trails-primary: #FF9900;
       --trails-primary-hover: #e68a00;
       --trails-text-inverse: #ffffff;
       --trails-focus-ring: rgba(255, 153, 0, 0.4);
       --trails-background: #1a1f2e;
       --trails-border-color: rgba(255, 255, 255, 0.15);
       --trails-text-primary: #E8E4E0;
       --trails-text-secondary: #9ca3af;`
    : `--trails-border-radius-button: 12px;
       --trails-border-radius-card: 16px;
       --trails-primary: #FF9900;
       --trails-primary-hover: #e68a00;
       --trails-text-inverse: #ffffff;
       --trails-focus-ring: rgba(255, 153, 0, 0.4);
       --trails-background: #ffffff;
       --trails-border-color: #e5e7eb;
       --trails-text-primary: #111827;
       --trails-text-secondary: #6b7280;`;

  function handleCheckoutQuote({ quote }: { sessionId: string; quote: { destinationTokenAmount?: string } }) {
    if (quote?.destinationTokenAmount) {
      const amountInUsdc = Number(quote.destinationTokenAmount) / 1e6;
      setBridgedAmount(amountInUsdc.toFixed(2));
    }
  }

  function handleBridgeComplete({ sessionId }: { sessionId: string }) {
    console.log('Bridge complete! Session:', sessionId);
    setBridgeComplete(true);
    setBridgeSessionId(sessionId);
  }

  function handleReset() {
    setBridgeComplete(false);
    setBridgeSessionId(null);
    setBridgedAmount(null);
  }

  const steps = [
    { icon: '1', title: f.step1Title || 'Choose any token', desc: f.step1Desc || 'Use any token from any chain. Trails finds the best route to USDC on Base automatically.' },
    { icon: '2', title: f.step2Title || 'One-click bridge', desc: f.step2Desc || 'Trails routes, approves, and bridges to SKALE — all in one transaction.' },
    { icon: '3', title: f.step3Title || 'USDC on SKALE', desc: f.step3Desc || 'After 5-15 minutes, USDC arrives on SKALE on Base. Ready for ultra-low gas API payments.' },
  ];

  const faqs = [
    { q: f.faqQ1 || 'How long does the bridge take?', a: f.faqA1 || 'The IMA bridge from Base to SKALE typically takes 5-15 minutes.' },
    { q: f.faqQ2 || 'What tokens can I use?', a: f.faqA2 || 'Any token on Ethereum, Polygon, Optimism, Arbitrum, or Base. Trails finds the best route automatically.' },
    { q: f.faqQ3 || 'Is there a minimum amount?', a: f.faqA3 || 'No minimum. Very small amounts may not be cost-effective due to gas fees.' },
    { q: f.faqQ4 || 'What if the bridge fails?', a: f.faqA4 || 'Trails provides automatic refunds. IMA bridge deposits are safe — tokens stay on Base if the bridge fails.' },
  ];

  return (
    <main className="min-h-screen animate-page-enter">
      {/* Hero */}
      <section ref={heroRef} className="reveal-section text-center py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-[#FF9900] mb-4">
            Powered by Trails + SKALE IMA
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {f.heroTitle || 'Fund Your Wallet'}
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            {f.heroSubtitle || 'Bridge USDC from any chain to SKALE on Base in 1 click. Pay for APIs instantly with ultra-low gas.'}
          </p>
        </div>
      </section>

      {/* Widget */}
      <section ref={widgetRef} className="reveal-section px-4 pb-16">
        <div className="max-w-lg mx-auto glass-card rounded-2xl p-6 space-y-4">
          {/* Recipient */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{f.recipientLabel || 'SKALE Recipient Address'}</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={address || '0x...'}
              disabled={bridgeComplete}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50"
            />
            <p className="text-xs text-gray-500">{f.recipientHint || 'Leave empty to use your connected wallet address'}</p>
          </div>

          {/* Info box */}
          {!bridgeComplete && (
            <div className="p-3 bg-[#FF9900]/10 border border-[#FF9900]/20 rounded-lg">
              <p className="text-sm text-[#FF9900]/80">
                <strong>{f.howItWorksInline || 'How it works:'}</strong>{' '}
                {f.howItWorksDesc || 'Choose any amount from any chain. Trails routes to Base, approves the SKALE bridge, and calls depositERC20Direct \u2014 all in one transaction.'}
              </p>
            </div>
          )}

          {/* Not connected */}
          {!isConnected && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
              <p className="text-sm text-yellow-400">{f.connectPrompt || 'Connect your wallet to bridge USDC'}</p>
            </div>
          )}

          {/* Trails Widget — 1-step: route + approve + bridge */}
          {isConnected && isValidRecipient && TRAILS_API_KEY && bridgeCalldata && !bridgeComplete && (
            <TrailsWidget
              apiKey={TRAILS_API_KEY}
              mode="fund"
              toChainId={8453}
              toToken={USDC_BASE_ADDRESS}
              toAddress={DEPOSIT_BOX_ERC20_ADDRESS}
              toCalldata={bridgeCalldata}
              theme={isDark ? 'dark' : 'light'}
              customCss={widgetCss}
              onCheckoutQuote={handleCheckoutQuote}
              onCheckoutComplete={handleBridgeComplete}
              onCheckoutError={({ error }: { sessionId: string; error: unknown }) => {
                console.error('Bridge error:', error);
              }}
              buttonText={f.bridgeButton || 'Bridge USDC to SKALE'}
            />
          )}

          {/* Invalid recipient */}
          {isConnected && !isValidRecipient && !bridgeComplete && (
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <p className="text-sm text-gray-400">{f.invalidAddress || 'Enter a valid recipient address to continue'}</p>
            </div>
          )}

          {/* No API key */}
          {isConnected && isValidRecipient && !TRAILS_API_KEY && !bridgeComplete && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              <p className="text-sm text-red-400">Trails API key not configured. Set VITE_TRAILS_API_KEY.</p>
            </div>
          )}

          {/* Success */}
          {bridgeComplete && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
                <p className="text-sm font-medium text-green-400">{f.successTitle || 'Bridge initiated!'}</p>
                {bridgedAmount && (
                  <p className="text-xs text-green-300"><strong>{f.successAmount || 'Amount'}:</strong> {bridgedAmount} USDC</p>
                )}
                <p className="text-xs text-green-300"><strong>{f.successRecipient || 'Recipient'}:</strong> {actualRecipient.slice(0, 6)}...{actualRecipient.slice(-4)}</p>
                {bridgeSessionId && (
                  <p className="text-xs text-green-300"><strong>Session:</strong> {bridgeSessionId.slice(0, 16)}...</p>
                )}
                <p className="text-xs text-green-300 mt-2">{f.successTiming || 'The IMA bridge typically takes 5-15 minutes to deliver tokens to SKALE.'}</p>
                <Link to="/services" className="inline-block mt-2 text-sm text-[#FF9900] hover:underline font-medium">
                  {f.startUsing || 'Start using APIs'} &rarr;
                </Link>
              </div>

              <button
                onClick={handleReset}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-medium transition-colors"
              >
                {f.bridgeMore || 'Bridge More'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section ref={howRef} className="reveal-section px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">{f.howTitle || 'How It Works'}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="glass-card rounded-xl p-6 text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#FF9900]/20 text-[#FF9900] flex items-center justify-center font-bold text-lg">
                  {s.icon}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">{f.faqTitle || 'Frequently Asked Questions'}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="glass-card rounded-xl p-4 group">
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
