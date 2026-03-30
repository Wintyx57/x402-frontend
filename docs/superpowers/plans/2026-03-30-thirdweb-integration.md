# Thirdweb Connect Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace RainbowKit with Thirdweb Connect to add social login (email/Google/GitHub/Passkey) + fiat onramp, while keeping wagmi intact via adapter.

**Architecture:** Add `@thirdweb-dev/wagmi-adapter` connector to existing wagmi config. Replace `RainbowKitProvider` with `ThirdwebProvider`. Replace RainbowKit `ConnectButton` with Thirdweb `ConnectButton`. Add "Buy with Card" tab on /fund page using headless fiat hooks. All 19 existing wagmi hook files remain untouched.

**Tech Stack:** thirdweb SDK, @thirdweb-dev/wagmi-adapter, wagmi 2.18.2, viem, React 19, Vite 7, Tailwind v4

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/thirdweb.ts` | CREATE | Thirdweb client init + wallet config |
| `src/components/BuyWithCard.tsx` | CREATE | Fiat onramp component (headless hooks, custom UI) |
| `src/wagmi.ts` | REWRITE | Remove RainbowKit connectors, add inAppWalletConnector |
| `src/main.tsx` | MODIFY | RainbowKitProvider → ThirdwebProvider |
| `src/components/ConnectButton.tsx` | REWRITE | RainbowKit → Thirdweb ConnectButton |
| `src/components/WalletInfo.tsx` | REWRITE | Remove ConnectButton.Custom, use wagmi useAccount + useDisconnect |
| `src/pages/FundWallet.tsx` | MODIFY | Add tabbed layout (Bridge / Buy with Card) |
| `src/i18n/translations.ts` | MODIFY | Add auth + fiat onramp keys EN/FR |
| `package.json` | MODIFY | +thirdweb +@thirdweb-dev/wagmi-adapter -@rainbow-me/rainbowkit |
| `vite.config.js` | MODIFY | Update chunk splitting |

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install thirdweb packages**

```bash
cd /c/Users/robin/OneDrive/Bureau/HACKATHON/x402-frontend
npm install thirdweb @thirdweb-dev/wagmi-adapter
```

- [ ] **Step 2: Uninstall RainbowKit**

```bash
npm uninstall @rainbow-me/rainbowkit
```

- [ ] **Step 3: Verify install**

```bash
npm ls thirdweb @thirdweb-dev/wagmi-adapter
```

Expected: both packages listed, no ERESOLVE errors.

- [ ] **Step 4: Verify build still compiles (will fail — expected)**

```bash
npm run build 2>&1 | head -20
```

Expected: build errors referencing `@rainbow-me/rainbowkit` — this is correct, we'll fix in next tasks.

---

### Task 2: Create Thirdweb client config

**Files:**
- Create: `src/lib/thirdweb.ts`

- [ ] **Step 1: Create the thirdweb client file**

```typescript
import { createThirdwebClient } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";

export const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "321a89162ee71061dd7a32e6304a8aef",
});

export const wallets = [
  inAppWallet({
    auth: { options: ["email", "google", "github", "passkey"] },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
];
```

- [ ] **Step 2: Add env var to .env**

Append to `.env` (or `.env.local`):

```
VITE_THIRDWEB_CLIENT_ID=321a89162ee71061dd7a32e6304a8aef
```

---

### Task 3: Rewrite wagmi config

**Files:**
- Rewrite: `src/wagmi.ts`

- [ ] **Step 1: Replace wagmi.ts with thirdweb adapter config**

```typescript
import { http, createConfig } from "wagmi";
import { base, baseSepolia, mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { inAppWalletConnector } from "@thirdweb-dev/wagmi-adapter";
import { thirdwebClient } from "./lib/thirdweb";
import type { Chain } from "wagmi/chains";

// SKALE on Base custom chain definition
export const skaleOnBase: Chain = {
  id: 1187947933,
  name: "SKALE on Base",
  nativeCurrency: { name: "CREDITS", symbol: "CREDITS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://skale-base.skalenodes.com/v1/base"] },
  },
  blockExplorers: {
    default: { name: "SKALE Explorer", url: "https://skale-base-explorer.skalenodes.com" },
  },
};

const chains = [skaleOnBase, base, baseSepolia, mainnet, polygon, optimism, arbitrum] as const;

export const config = createConfig({
  chains,
  connectors: [
    inAppWalletConnector({
      client: thirdwebClient,
    }),
  ],
  transports: {
    [skaleOnBase.id]: http("https://skale-base.skalenodes.com/v1/base"),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: false,
});
```

---

### Task 4: Update main.tsx providers

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Replace RainbowKit with Thirdweb provider**

Remove these imports:
```typescript
// REMOVE:
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
```

Add this import:
```typescript
import { ThirdwebProvider } from "thirdweb/react";
```

- [ ] **Step 2: Replace provider in JSX**

Change the render tree from:
```tsx
<WagmiProvider config={config}>
  <QueryClientProvider client={queryClient}>
    <RainbowKitProvider locale="en" theme={darkTheme({ accentColor: '#FF9900', accentColorForeground: 'white', borderRadius: 'medium' })} modalSize="compact">
      <BrowserRouter>
        ...
      </BrowserRouter>
    </RainbowKitProvider>
  </QueryClientProvider>
</WagmiProvider>
```

To:
```tsx
<WagmiProvider config={config}>
  <QueryClientProvider client={queryClient}>
    <ThirdwebProvider>
      <BrowserRouter>
        ...
      </BrowserRouter>
    </ThirdwebProvider>
  </QueryClientProvider>
</WagmiProvider>
```

---

### Task 5: Rewrite ConnectButton

**Files:**
- Rewrite: `src/components/ConnectButton.tsx`

- [ ] **Step 1: Replace with Thirdweb ConnectButton**

```tsx
import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react";
import { thirdwebClient, wallets } from "../lib/thirdweb";

export default function ConnectButton() {
  return (
    <ThirdwebConnectButton
      client={thirdwebClient}
      wallets={wallets}
      connectButton={{
        label: "Sign In",
        className: "!text-xs !font-medium !px-3 !py-1.5 !rounded-lg !bg-[#FF9900] !text-white hover:!bg-[#FF9900]/90 !transition-colors !cursor-pointer !border-none",
      }}
      theme="dark"
      connectModal={{
        size: "compact",
        title: "Sign in to x402 Bazaar",
        showThirdwebBranding: false,
      }}
    />
  );
}
```

---

### Task 6: Rewrite WalletInfo

**Files:**
- Rewrite: `src/components/WalletInfo.tsx`

- [ ] **Step 1: Replace RainbowKit ConnectButton.Custom with wagmi hooks + Thirdweb**

```tsx
import { useAccount, useDisconnect } from "wagmi";
import { useUsdcBalance } from "../hooks/useUsdcBalance";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../i18n/LanguageContext";
import ConnectButton from "./ConnectButton";

export default function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { balance, isLoading: balanceLoading } = useUsdcBalance();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isConnected || !address) {
    return <ConnectButton />;
  }

  const displayBalance = balanceLoading ? "..." : balance ? parseFloat(balance).toFixed(2) : "0.00";
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        aria-haspopup="menu"
        aria-label={`${t.connect.wallet}: ${displayBalance} USDC — ${shortAddress}`}
        className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg
                   bg-white/8 border border-white/10 text-white hover:bg-white/12
                   transition-colors cursor-pointer"
      >
        <span className="text-[#FF9900] font-semibold">{displayBalance} USDC</span>
        <span className="text-gray-400">|</span>
        <span>{shortAddress}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-[180px] bg-[#1a1f2e] border border-white/10
                        rounded-lg shadow-xl py-1 z-50 animate-fade-in">
          <Link
            to="/my-apis"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white
                       hover:bg-white/5 no-underline transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {t.myApis?.title || "My APIs"}
          </Link>
          <Link
            to="/fund"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white
                       hover:bg-white/5 no-underline transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.nav.fund}
          </Link>
          <div className="border-t border-white/10 my-1" />
          <button
            onClick={() => { disconnect(); setDropdownOpen(false); }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300
                       hover:bg-white/5 cursor-pointer bg-transparent border-none text-left transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t.connect.disconnect}
          </button>
        </div>
      )}
    </div>
  );
}
```

Note: We removed the "Switch Network" button (chain icon was from RainbowKit) and the `openChainModal`/`openAccountModal` calls. Chain switching is still available via the `ChainSelector` component on relevant pages. Disconnect now uses wagmi's `useDisconnect` directly.

---

### Task 7: Create BuyWithCard component

**Files:**
- Create: `src/components/BuyWithCard.tsx`

- [ ] **Step 1: Create the fiat onramp component with headless hooks**

```tsx
import { useState } from "react";
import { useAccount } from "wagmi";
import { useBuyWithFiatQuote, useBuyWithFiatStatus } from "thirdweb/react";
import { thirdwebClient } from "../lib/thirdweb";
import { CHAIN_CONFIG } from "../config";
import { useTranslation } from "../i18n/LanguageContext";

export default function BuyWithCard({ chainId }: { chainId: number }) {
  const { address } = useAccount();
  const { t } = useTranslation();
  const f = t.fund || ({} as Record<string, string>);
  const [amount, setAmount] = useState("10");
  const [intentId, setIntentId] = useState<string | null>(null);

  const chainConfig = CHAIN_CONFIG[chainId];
  const usdcAddress = chainConfig?.usdcContract;

  const quote = useBuyWithFiatQuote(
    address && usdcAddress
      ? {
          client: thirdwebClient,
          fromCurrencySymbol: "USD",
          toChainId: chainId,
          toAmount: amount,
          toTokenAddress: usdcAddress,
          toAddress: address,
        }
      : undefined,
  );

  const status = useBuyWithFiatStatus(
    intentId
      ? {
          client: thirdwebClient,
          intentId,
        }
      : undefined,
  );

  const handleBuy = () => {
    if (quote.data?.onRampLink) {
      setIntentId(quote.data.intentId);
      window.open(quote.data.onRampLink, "_blank");
    }
  };

  if (!address) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {f.connectFirst || "Connect your wallet first"}
      </div>
    );
  }

  if (!usdcAddress) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {f.chainNotSupported || "Fiat onramp not available for this chain"}
      </div>
    );
  }

  const isComplete = status.data?.status === "CRYPTO_SWAP_COMPLETED";
  const isPending = intentId && !isComplete;

  return (
    <div className="space-y-4">
      {/* Amount input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {f.enterAmount || "Amount (USD)"}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="1"
            max="10000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white text-sm focus:border-[#FF9900]/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Quote details */}
      {quote.isLoading && (
        <div className="text-sm text-gray-400 animate-pulse">
          {f.gettingQuote || "Getting quote..."}
        </div>
      )}

      {quote.data && (
        <div className="glass-card rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">{f.youllReceive || "You'll receive"}</span>
            <span className="text-white font-medium">
              ~{parseFloat(amount).toFixed(2)} USDC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">{f.chain || "Chain"}</span>
            <span className="text-white">{chainConfig.label}</span>
          </div>
          {quote.data.estimatedDurationSeconds && (
            <div className="flex justify-between">
              <span className="text-gray-400">{f.estimatedTime || "Estimated time"}</span>
              <span className="text-white">
                ~{Math.ceil(quote.data.estimatedDurationSeconds / 60)} min
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status tracking */}
      {isPending && (
        <div className="glass-card rounded-xl p-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF9900] animate-pulse" />
            <span className="text-[#FF9900]">
              {f.processing || "Processing your purchase..."}
            </span>
          </div>
          {status.data?.status && (
            <p className="text-gray-400 mt-1 text-xs">
              Status: {status.data.status.replace(/_/g, " ").toLowerCase()}
            </p>
          )}
        </div>
      )}

      {isComplete && (
        <div className="glass-card rounded-xl p-4 text-sm border-green-500/20">
          <div className="flex items-center gap-2 text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {f.purchaseComplete || "Purchase complete! USDC added to your wallet."}
          </div>
        </div>
      )}

      {/* Buy button */}
      <button
        onClick={handleBuy}
        disabled={!quote.data || quote.isLoading || !!isPending}
        className="w-full py-3 rounded-xl font-medium text-sm transition-all
                   bg-gradient-to-r from-[#FF9900] to-[#e68a00] text-white
                   hover:shadow-lg hover:shadow-[#FF9900]/20
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending
          ? f.processing || "Processing..."
          : f.buyWithCard || "Buy with Card"}
      </button>
    </div>
  );
}
```

---

### Task 8: Update FundWallet page with tabs

**Files:**
- Modify: `src/pages/FundWallet.tsx`

- [ ] **Step 1: Add tabbed layout and BuyWithCard import**

Add imports at the top:
```typescript
import { lazy, Suspense, useState } from 'react';  // add useState
import { useAccount, useChainId } from 'wagmi';     // add this line
```

Add lazy import for BuyWithCard:
```typescript
const BuyWithCard = lazy(() => import('../components/BuyWithCard'));
```

- [ ] **Step 2: Add tab state and chain hooks inside the component**

After `const f = t.fund || {} as Record<string, string>;` add:

```typescript
const [activeTab, setActiveTab] = useState<'card' | 'bridge'>('card');
const chainId = useChainId();
```

- [ ] **Step 3: Add tab selector before the Bridge Card section**

Replace the `{/* ===== Bridge Card ===== */}` section with:

```tsx
{/* ===== Tab Selector ===== */}
<section className="relative z-10 px-4 pb-2">
  <div className="max-w-lg mx-auto flex gap-1 p-1 bg-white/5 rounded-xl">
    <button
      onClick={() => setActiveTab('card')}
      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
        activeTab === 'card'
          ? 'bg-[#FF9900] text-white shadow-lg'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {f.buyWithCard || 'Buy with Card'}
    </button>
    <button
      onClick={() => setActiveTab('bridge')}
      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
        activeTab === 'bridge'
          ? 'bg-[#FF9900] text-white shadow-lg'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {f.bridgeTab || 'Bridge Crypto'}
    </button>
  </div>
</section>

{/* ===== Tab Content ===== */}
<section ref={widgetRef} className="reveal-section relative z-10 px-4 pb-6">
  {activeTab === 'card' ? (
    <div className="max-w-lg mx-auto glass-card rounded-2xl p-5">
      <Suspense fallback={<BridgeWidgetSkeleton />}>
        <BuyWithCard chainId={chainId} />
      </Suspense>
    </div>
  ) : (
    <Suspense fallback={<BridgeWidgetSkeleton />}>
      <BridgeWidget />
    </Suspense>
  )}
</section>
```

---

### Task 9: Add i18n translations

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add new keys to English translations**

Inside the `en` object, inside the `fund` section, add:

```typescript
buyWithCard: "Buy with Card",
bridgeTab: "Bridge Crypto",
enterAmount: "Amount (USD)",
gettingQuote: "Getting quote...",
youllReceive: "You'll receive",
chain: "Chain",
estimatedTime: "Estimated time",
processing: "Processing your purchase...",
purchaseComplete: "Purchase complete! USDC added to your wallet.",
connectFirst: "Connect your wallet first",
chainNotSupported: "Fiat onramp not available for this chain",
```

- [ ] **Step 2: Add same keys to French translations**

Inside the `fr` object, inside the `fund` section, add:

```typescript
buyWithCard: "Acheter par carte",
bridgeTab: "Bridge Crypto",
enterAmount: "Montant (USD)",
gettingQuote: "Obtention du devis...",
youllReceive: "Vous recevrez",
chain: "Blockchain",
estimatedTime: "Temps estime",
processing: "Achat en cours...",
purchaseComplete: "Achat termine ! USDC ajoute a votre wallet.",
connectFirst: "Connectez votre wallet d'abord",
chainNotSupported: "Achat par carte non disponible pour cette blockchain",
```

---

### Task 10: Update vite.config.js chunk splitting

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Replace RainbowKit references with Thirdweb**

In the `manualChunks` function, replace:

```javascript
// WalletConnect — isolated (very heavy, used by rainbowkit)
if (id.includes('@walletconnect')) {
  return 'vendor-walletconnect';
}
// Web3 core: viem + wagmi + metamask + rainbow + react-query — tightly coupled
if (
  id.includes('/viem/') ||
  id.includes('wagmi') ||
  id.includes('@metamask') ||
  id.includes('metamask-sdk') ||
  id.includes('@rainbow-me') ||
  id.includes('@tanstack/react-query')
) {
  return 'vendor-web3';
}
```

With:

```javascript
// Thirdweb SDK — isolated (social login, fiat onramp)
if (id.includes('thirdweb')) {
  return 'vendor-thirdweb';
}
// Web3 core: viem + wagmi + react-query
if (
  id.includes('/viem/') ||
  id.includes('wagmi') ||
  id.includes('@tanstack/react-query')
) {
  return 'vendor-web3';
}
```

---

### Task 11: Build, test, fix

- [ ] **Step 1: Run TypeScript check**

```bash
cd /c/Users/robin/OneDrive/Bureau/HACKATHON/x402-frontend && npx tsc --noEmit 2>&1 | head -40
```

Fix any type errors.

- [ ] **Step 2: Run build**

```bash
npm run build 2>&1 | tail -20
```

Expected: successful build with no errors.

- [ ] **Step 3: Run tests**

```bash
npm test 2>&1
```

Fix any failing tests (likely tests that import from `@rainbow-me/rainbowkit`).

- [ ] **Step 4: Clean up any remaining RainbowKit references**

```bash
grep -r "rainbow" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: no files. If any found, remove the references.

---

### Task 12: Dev server smoke test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:5173` and verify:
1. "Sign In" button appears in navbar
2. Clicking opens Thirdweb modal with Email/Google/GitHub/Passkey options
3. MetaMask/Coinbase/Rabby also available in modal
4. After connecting: wallet address + USDC balance shown in dropdown
5. Dropdown has My APIs, Fund Wallet, Disconnect links
6. `/fund` page shows "Buy with Card" and "Bridge Crypto" tabs
7. Payment flow on `/paywall/:id` still works with connected wallet

---

### Task 13: Add env var to Vercel + commit

- [ ] **Step 1: Add VITE_THIRDWEB_CLIENT_ID to Vercel**

```bash
cd /c/Users/robin/OneDrive/Bureau/HACKATHON/x402-frontend
# Via Vercel CLI or dashboard
# vercel env add VITE_THIRDWEB_CLIENT_ID
```

Value: `321a89162ee71061dd7a32e6304a8aef`

- [ ] **Step 2: Remove VITE_WALLETCONNECT_PROJECT_ID from Vercel (if set)**

No longer needed — Thirdweb handles WalletConnect internally.

- [ ] **Step 3: Commit all changes**

```bash
git add -A
git commit -m "feat: replace RainbowKit with Thirdweb Connect — social login + fiat onramp"
```

- [ ] **Step 4: Push to deploy**

```bash
git push
```
