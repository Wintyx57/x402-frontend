import { useState } from 'react';
import { TrailsWidget } from '0xtrails/widget';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, erc20Abi } from 'viem';
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
  const [fundComplete, setFundComplete] = useState(false);
  const [bridgeAmount, setBridgeAmount] = useState('');
  const [step, setStep] = useState<'fund' | 'bridge' | 'done'>('fund');

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

  // Step 2: Approve USDC for DepositBox
  const { writeContract: approveUsdc, data: approveTxHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // Step 3: Bridge via IMA DepositBox
  const { writeContract: bridgeToSkale, data: bridgeTxHash, isPending: isBridging } = useWriteContract();
  const { isLoading: isBridgeConfirming, isSuccess: isBridgeConfirmed } = useWaitForTransactionReceipt({ hash: bridgeTxHash });

  const isDark = theme === 'dark';

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

  function handleFundComplete({ sessionId }: { sessionId: string }) {
    console.log('Fund complete:', sessionId);
    setFundComplete(true);
    setStep('bridge');
  }

  function handleApproveAndBridge() {
    if (!bridgeAmount || !isValidRecipient) return;
    const amount = parseUnits(bridgeAmount, 6);

    approveUsdc({
      address: USDC_BASE_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [DEPOSIT_BOX_ERC20_ADDRESS, amount],
    });
  }

  function handleBridge() {
    if (!bridgeAmount || !isValidRecipient) return;
    const amount = parseUnits(bridgeAmount, 6);

    bridgeToSkale({
      address: DEPOSIT_BOX_ERC20_ADDRESS,
      abi: depositBoxErc20Abi,
      functionName: 'depositERC20Direct',
      args: [SKALE_CHAIN_NAME, USDC_BASE_ADDRESS, amount, actualRecipient],
    });
  }

  // Auto-trigger bridge after approve confirms
  if (isApproveConfirmed && !bridgeTxHash && !isBridging) {
    handleBridge();
  }

  if (isBridgeConfirmed && step !== 'done') {
    setStep('done');
  }

  function handleReset() {
    setFundComplete(false);
    setBridgeAmount('');
    setStep('fund');
  }

  const steps = [
    { icon: '1', title: f.step1Title || 'Get USDC on Base', desc: f.step1Desc || 'Use any token from any chain. Trails routes it to USDC on Base automatically.' },
    { icon: '2', title: f.step2Title || 'Bridge to SKALE', desc: f.step2Desc || 'One click to bridge your USDC from Base to SKALE via the IMA bridge.' },
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
            {f.heroSubtitle || 'Bridge USDC from any chain to SKALE on Base in 2 steps. Pay for APIs instantly with ultra-low gas.'}
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
              disabled={step !== 'fund'}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50"
            />
            <p className="text-xs text-gray-500">{f.recipientHint || 'Leave empty to use your connected wallet address'}</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${step === 'fund' ? 'bg-[#FF9900]/20 text-[#FF9900]' : 'bg-green-500/20 text-green-400'}`}>
              {step === 'fund' ? '1' : '\u2713'} Get USDC on Base
            </span>
            <span className="text-gray-600">&rarr;</span>
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${step === 'bridge' ? 'bg-[#FF9900]/20 text-[#FF9900]' : step === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
              {step === 'done' ? '\u2713' : '2'} Bridge to SKALE
            </span>
          </div>

          {/* Step 1: Fund with Trails */}
          {step === 'fund' && (
            <>
              {!isConnected && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                  <p className="text-sm text-yellow-400">{f.connectPrompt || 'Connect your wallet to bridge USDC'}</p>
                </div>
              )}

              {isConnected && isValidRecipient && TRAILS_API_KEY && (
                <>
                  <p className="text-xs text-gray-400 text-center">
                    Already have USDC on Base?{' '}
                    <button onClick={() => setStep('bridge')} className="text-[#FF9900] hover:underline font-medium">
                      Skip to bridge &rarr;
                    </button>
                  </p>
                  <TrailsWidget
                    apiKey={TRAILS_API_KEY}
                    mode="fund"
                    toChainId={8453}
                    toToken="USDC"
                    toAddress={actualRecipient}
                    theme={isDark ? 'dark' : 'light'}
                    customCss={widgetCss}
                    onCheckoutComplete={handleFundComplete}
                    onCheckoutError={({ error }: { sessionId: string; error: unknown }) => {
                      console.error('Fund error:', error);
                    }}
                    buttonText={f.bridgeButton || 'Get USDC on Base'}
                  />
                </>
              )}

              {isConnected && !isValidRecipient && (
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <p className="text-sm text-gray-400">{f.invalidAddress || 'Enter a valid recipient address to continue'}</p>
                </div>
              )}

              {isConnected && isValidRecipient && !TRAILS_API_KEY && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <p className="text-sm text-red-400">Trails API key not configured. Set VITE_TRAILS_API_KEY.</p>
                </div>
              )}
            </>
          )}

          {/* Step 2: Bridge to SKALE */}
          {step === 'bridge' && (
            <div className="space-y-4">
              {fundComplete && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 font-medium">Step 1 complete — USDC on Base</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount to bridge (USDC)</label>
                <input
                  type="number"
                  value={bridgeAmount}
                  onChange={(e) => setBridgeAmount(e.target.value)}
                  placeholder="e.g. 5"
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50"
                />
              </div>

              <button
                onClick={handleApproveAndBridge}
                disabled={!bridgeAmount || Number(bridgeAmount) <= 0 || isApproving || isApproveConfirming || isBridging || isBridgeConfirming}
                className="w-full h-12 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                {isApproving ? 'Approve USDC...' :
                 isApproveConfirming ? 'Confirming approval...' :
                 isBridging ? 'Bridging to SKALE...' :
                 isBridgeConfirming ? 'Confirming bridge...' :
                 `Bridge ${bridgeAmount || '...'} USDC to SKALE`}
              </button>

              <p className="text-xs text-gray-500 text-center">
                2 transactions: approve USDC + deposit into IMA bridge. Gas ~$0.01 on Base.
              </p>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
                <p className="text-sm font-medium text-green-400">{f.successTitle || 'Bridge initiated!'}</p>
                <p className="text-xs text-green-300"><strong>{f.successAmount || 'Amount'}:</strong> {bridgeAmount} USDC</p>
                <p className="text-xs text-green-300"><strong>{f.successRecipient || 'Recipient'}:</strong> {actualRecipient.slice(0, 6)}...{actualRecipient.slice(-4)}</p>
                {bridgeTxHash && (
                  <a
                    href={`https://basescan.org/tx/${bridgeTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#FF9900] hover:underline"
                  >
                    View on BaseScan &rarr;
                  </a>
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
