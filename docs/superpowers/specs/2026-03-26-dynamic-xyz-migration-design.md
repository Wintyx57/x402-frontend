# Migration RainbowKit → Dynamic.xyz — Custodial Wallets

**Date:** 2026-03-26
**Status:** Approved
**Goal:** Replace RainbowKit with Dynamic.xyz to support both embedded wallets (email/Google login → MPC wallet) and external wallets (MetaMask, Coinbase) in a single unified flow.

---

## Context

x402 Bazaar currently requires a crypto wallet (MetaMask, Coinbase Wallet) to interact with the platform. This blocks 90%+ of developers who don't have a wallet or USDC. Dynamic.xyz provides embedded wallets (email/Google → MPC wallet created in background) alongside traditional wallet connections, in one SDK.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| SDK | Dynamic.xyz v4.71.0 | Official RainbowKit migration guide, wagmi 2.18.2 compatible, embedded + external in same widget |
| Migration strategy | Big bang (approach A) | Clean, no cohabitation state. Only 4 structural files to rewrite, wagmi hooks untouched |
| Connect UI | Keep custom dropdown (WalletInfo.tsx) | Preserve existing UX (USDC balance, My APIs, Fund Wallet, Switch Network) |
| Auth modal | Dynamic's built-in auth flow | Triggered via `setShowAuthFlow(true)`, handles email/Google/MetaMask selection |
| Fiat onramp | NOT in scope | Deferred to a separate feature after migration is stable |

## Packages

### Install
- `@dynamic-labs/sdk-react-core@4.71.0`
- `@dynamic-labs/wagmi-connector@4.71.0`
- `@dynamic-labs/ethereum@4.71.0`
- `@dynamic-labs/embedded-wallet@4.71.0`

### Remove
- `@rainbow-me/rainbowkit`

### Unchanged
- `wagmi@2.18.2` (Dynamic requires `^2.14.11` — compatible)
- `viem@^2.47.1` (Dynamic requires `^2.45.3` — compatible)
- `@tanstack/react-query@^5.90.20`
- `0xtrails@^0.9.6`

## Files Changed

### Structural rewrites (4 files)

**`src/wagmi.ts`**
- Remove: `getDefaultConfig`, `connectorsForWallets` from `@rainbow-me/rainbowkit`
- Replace with: pure wagmi `createConfig` with `http()` transports
- Export `evmNetworks` array for Dynamic (Base, Polygon, SKALE custom chain)
- Keep: same chains (base, baseSepolia, skaleOnBase, mainnet, polygon, optimism, arbitrum), same transports

**`src/main.tsx`**
- Remove: `RainbowKitProvider`, `darkTheme` from `@rainbow-me/rainbowkit`
- Replace with: `DynamicContextProvider` wrapping `DynamicWagmiConnector`
- Provider order: `DynamicContextProvider` > `DynamicWagmiConnector` > `QueryClientProvider` > `BrowserRouter` > `ThemeProvider` > `LanguageProvider` > `App`
- Config: `environmentId` from `VITE_DYNAMIC_ENV_ID`, `walletConnectors: [EthereumWalletConnectors]`, `walletConnectorExtensions: [EmbeddedWalletConnector]`, custom `evmNetworks`, CSS overrides for orange theme

**`src/components/ConnectButton.tsx`**
- Remove: `ConnectButton as RainbowConnectButton` from `@rainbow-me/rainbowkit`
- Replace with: custom button that calls `useDynamicContext().setShowAuthFlow(true)`
- Keep: same visual style, same responsive behavior

**`src/components/WalletInfo.tsx`**
- Remove: `ConnectButton.Custom` render props from RainbowKit (`openChainModal`, `openAccountModal`)
- Replace with: `useDynamicContext()` for auth state + `useAccount()` from wagmi for address/chain
- Keep: custom dropdown UI intact (USDC balance via `useUsdcBalance`, My APIs link, Fund Wallet link, Switch Network via `useSwitchChain`, Disconnect)

### Hook replacement (6 files)

Replace `useConnectModal().openConnectModal()` from `@rainbow-me/rainbowkit` with `useDynamicContext().setShowAuthFlow(true)`:

- `src/pages/CreatorDashboard.tsx`
- `src/pages/Paywall.tsx`
- `src/components/register/ListApiForm.tsx`
- `src/components/register/PaymentLinkForm.tsx`
- `src/pages/ImportOpenAPI.tsx`
- `src/pages/ImportRapidAPI.tsx`

### ConnectButton swap (1 file)

**`src/components/BridgeCard.tsx`**
- Replace RainbowKit `ConnectButton` import with our custom `ConnectButton`

### Files NOT changed (15+ files)

All files using only wagmi hooks remain untouched:
- `useAccount()` — 12+ files (ChainSelector, ReviewForm, hooks/useMyServices, hooks/useProviderRevenue, hooks/useProviderAnalytics, ServiceDetail, MyApis, etc.)
- `useReadContract()` — useUsdcBalance, useUsdcAllowance
- `useWriteContract()` — BridgeCard, Paywall
- `useWaitForTransactionReceipt()` — BridgeCard, Paywall
- `useSwitchChain()` — ChainSelector, BridgeCard
- `useSignMessage()` — useWalletSign, register forms
- `useWalletClient()` — BridgeCard
- `useChainId()` — useUsdcBalance

The `DynamicWagmiConnector` bridges Dynamic's wallet state into wagmi, so all existing hooks work transparently.

## Dynamic Dashboard Configuration

Login methods to enable:
- Email (embedded wallet)
- Google (embedded wallet)
- MetaMask (external)
- Coinbase Wallet (external)
- WalletConnect (external, handles 500+ wallets)

Chains to enable:
- Base (8453)
- Polygon (137)
- SKALE on Base (1187947933) — via custom `evmNetworks` prop

Theme: orange accent `#FF9900` to match x402 Bazaar branding.

## Environment Variables

### Add
- `VITE_DYNAMIC_ENV_ID` — from Dynamic.xyz dashboard (free tier, 1000 MAU)

### Remove
- `VITE_WALLETCONNECT_PROJECT_ID` — Dynamic manages WalletConnect internally

## User Flows

### New visitor (email login)
1. Click "Connect" → Dynamic auth modal appears
2. Choose "Email" or "Google"
3. MPC wallet created in background (non-custodial, TSS)
4. User is connected with an EVM address
5. Can deposit USDC via /fund bridge page
6. Can pay for APIs normally

### Crypto user (external wallet)
1. Click "Connect" → Dynamic auth modal appears
2. Choose MetaMask / Coinbase / WalletConnect
3. Standard wallet connection flow (identical to current)
4. Connected with their existing address

### Both flows produce identical state
- `useAccount()` returns `{ address, isConnected, chain }` in both cases
- All payment, signing, and transaction hooks work the same way
- The rest of the codebase cannot distinguish between embedded and external wallets

## Edge Cases

| Case | Behavior |
|------|----------|
| User switches from email to MetaMask | Dynamic handles multi-wallet. Primary wallet used for transactions. |
| Embedded wallet on unsupported chain | Dynamic auto-switches to supported chain from `evmNetworks` |
| Export private key (embedded) | Dynamic SDK provides `exportPrivateKey()` — user can migrate to MetaMask |
| Session persistence | Dynamic handles session cookies/JWT. User stays logged in across page reloads. |
| Mobile browser | Dynamic's auth modal is responsive. Email flow works on mobile. MetaMask deep-links work. |

## Testing Plan

1. Email login → wallet created → address visible in WalletInfo dropdown
2. Google login → same flow
3. MetaMask login → identical to current behavior
4. USDC balance display works for all wallet types
5. Payment flow (Paywall.tsx) works with embedded wallet
6. Chain switching works (SKALE, Base, Polygon)
7. Bridge (BridgeCard) works with embedded wallet
8. Sign message works (register API, reviews)
9. All 15+ files with wagmi hooks still function correctly
10. Mobile responsive: auth modal, wallet dropdown
