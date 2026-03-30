# Thirdweb Connect Integration — Design Spec

**Date:** 2026-03-30
**Status:** Approved
**Replaces:** `2026-03-26-custodial-wallets-design.md` (DIY approach abandoned)

## Decision

Replace DIY embedded wallets (Supabase Auth + AES-256-GCM) with **Thirdweb Connect**.

**Why:** MPC security > client-side AES, 2 days vs 2 weeks, fiat onramp included, AI agents focus aligned with x402 Bazaar.

**Plan:** Starter plan ($5/month), Client ID: `321a89162ee71061dd7a32e6304a8aef`

## Scope

- Replace RainbowKit with Thirdweb Connect (social login + external wallets)
- Keep wagmi intact via `@thirdweb-dev/wagmi-adapter` — 19 existing files unchanged
- Add fiat onramp on /fund page using headless hooks (our UI, not widget)
- Backend: zero changes

## Architecture

### Provider Hierarchy (main.tsx)

```
BEFORE:
WagmiProvider > QueryClientProvider > RainbowKitProvider > App

AFTER:
WagmiProvider > QueryClientProvider > ThirdwebProvider > App
```

### Auth Methods

Via `inAppWallet`:
- Email (magic link / OTP)
- Google
- GitHub
- Passkey (FaceID/TouchID/Windows Hello)

Via `createWallet`:
- MetaMask
- Coinbase Wallet
- Rabby
- (any injected wallet)

### Wagmi Adapter

`inAppWalletConnector` from `@thirdweb-dev/wagmi-adapter` is added to the wagmi config. All existing wagmi hooks (`useAccount`, `useWriteContract`, `useSignMessage`, `useSwitchChain`, etc.) work transparently with both in-app and external wallets.

### Chains

- **SKALE on Base** (1187947933) — `defineChain` with custom RPC
- **Base** (8453) — native support
- **Polygon** (137) — native support

### Fiat Onramp (/fund page)

New "Buy with Card" tab alongside existing "Bridge" tab (Trails).

Flow:
1. User selects chain (existing ChainSelector)
2. User enters USD amount
3. `useBuyWithFiatQuote` → display quote (USDC amount, fees, estimated time)
4. User clicks "Buy" → opens `quote.onRampLink` in new tab
5. `useBuyWithFiatStatus` polls progress → display in our UI
6. On completion → USDC balance updates

**No Thirdweb widget visible** — all custom UI matching existing design system.

## Files

### New Files

| File | Purpose |
|------|---------|
| `src/lib/thirdweb.ts` | Thirdweb client init + wallet config |
| `src/components/BuyWithCard.tsx` | Fiat onramp tab (custom UI, headless hooks) |

### Modified Files

| File | Change |
|------|--------|
| `src/main.tsx` | `RainbowKitProvider` → `ThirdwebProvider` |
| `src/wagmi.ts` | Remove RainbowKit connectors, add `inAppWalletConnector` |
| `src/components/ConnectButton.tsx` | RainbowKit → Thirdweb `ConnectButton` |
| `src/components/WalletInfo.tsx` | Adapt to Thirdweb connected wallet format |
| `src/pages/FundWallet.tsx` | Add "Buy with Card" tab |
| `src/i18n/translations.ts` | New keys (auth, fund with card) |
| `package.json` | +thirdweb +@thirdweb-dev/wagmi-adapter -@rainbow-me/rainbowkit |
| `.env` | +VITE_THIRDWEB_CLIENT_ID -VITE_WALLETCONNECT_PROJECT_ID |
| `vite.config.js` | Update chunk splitting (remove vendor-walletconnect, add vendor-thirdweb) |

### Unchanged (19 files using wagmi hooks)

All files using `useAccount()`, `useWriteContract()`, `useWaitForTransactionReceipt()`, `useSignMessage()`, `useSwitchChain()`, `useReadContract()`, `useChainId()`, `useWalletClient()` — zero changes needed.

Includes: `Paywall.tsx`, `ListApiForm.tsx`, `PaymentLinkForm.tsx`, `BridgeCard.tsx`, `ChainSelector.tsx`, `ReviewForm.tsx`, `MyApis.tsx`, `CreatorDashboard.tsx`, `ImportOpenAPI.tsx`, `ImportRapidAPI.tsx`, `ServiceDetail.tsx`, `useUsdcBalance.ts`, `useUsdcAllowance.ts`, `useWalletSign.ts`, `useProviderAnalytics.ts`, `useProviderRevenue.ts`, `useMyServices.ts`.

### Backend: Zero Changes

Payment verification is tx-hash based. It doesn't matter if the USDC transfer comes from MetaMask or a Thirdweb in-app wallet — same on-chain transaction.

## Environment Variables

| Variable | Value | Where |
|----------|-------|-------|
| `VITE_THIRDWEB_CLIENT_ID` | `321a89162ee71061dd7a32e6304a8aef` | `.env` + Vercel |
| `VITE_WALLETCONNECT_PROJECT_ID` | REMOVE | Was in `.env` |

## Dependencies

### Add
- `thirdweb` — SDK + React components + hooks
- `@thirdweb-dev/wagmi-adapter` — wagmi connector for in-app wallets

### Remove
- `@rainbow-me/rainbowkit` — fully replaced by Thirdweb Connect

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| SKALE chain not supported by Thirdweb | `defineChain` with custom RPC — verified in docs |
| Payment flow regression | wagmi hooks unchanged — same `useWriteContract` for USDC transfer |
| WalletConnect breaks | Thirdweb handles WalletConnect internally, no separate project ID needed |
| Fiat onramp not available in all countries | Thirdweb uses multiple providers (Stripe, Transak, Coinbase) — best coverage |

## i18n Keys to Add

```
auth.signIn → "Sign In" / "Se connecter"
auth.signInWith → "Sign in with" / "Se connecter avec"
auth.email → "Email" / "Email"
auth.orContinueWith → "Or continue with" / "Ou continuer avec"
auth.connectWallet → "Connect Wallet" / "Connecter un wallet"
fund.buyWithCard → "Buy with Card" / "Acheter par carte"
fund.enterAmount → "Enter amount (USD)" / "Montant (USD)"
fund.getQuote → "Get Quote" / "Obtenir un devis"
fund.estimatedReceive → "You'll receive" / "Vous recevrez"
fund.processingFee → "Processing fee" / "Frais de traitement"
fund.estimatedTime → "Estimated time" / "Temps estime"
fund.buyNow → "Buy Now" / "Acheter maintenant"
fund.processing → "Processing..." / "Traitement en cours..."
fund.purchaseComplete → "Purchase complete!" / "Achat termine !"
```
