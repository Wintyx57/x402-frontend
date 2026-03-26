# Custodial Wallets + Fiat Onramp — Supabase Auth + Embedded Wallet + Transak

**Date:** 2026-03-26
**Status:** Approved
**Goal:** Allow non-crypto users to sign in with email/Google, get a wallet automatically, and buy USDC with a credit card. Existing RainbowKit wallet flow stays intact.

---

## Context

x402 Bazaar requires a crypto wallet to pay for APIs. This blocks 90%+ of developers who don't own crypto. The free tier (session 98) lets them test with 5 calls/day, but to go beyond they need USDC. This feature provides the full path: sign in with email → get a wallet → buy USDC with a card → pay for APIs.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth provider | Supabase Auth | Already using Supabase, free, no per-user pricing, supports email + Google + GitHub |
| Wallet generation | viem `generatePrivateKey()` client-side | No external dependency, standard EVM wallet |
| Key storage | AES-256-GCM encrypted in Supabase `user_wallets` | Client-side encryption, server never sees plaintext key |
| Encryption key derivation | PBKDF2 from Supabase auth token + user ID salt | Unique per user, tied to auth session |
| wagmi integration | Custom connector | Plugs embedded wallet into existing wagmi hooks transparently |
| External wallets | Keep RainbowKit as-is | Zero risk, no migration needed |
| Fiat onramp | Transak widget on /fund | Zero fixed cost, ~1-3% commission per transaction, supports Base + Polygon |

## Architecture

```
ConnectButton → 2 paths:

  Path A: "Sign in" (new)
    → Supabase Auth modal (email / Google / GitHub)
    → useEmbeddedWallet hook
      → First login: generatePrivateKey() → encrypt → store in Supabase
      → Return login: fetch encrypted blob → decrypt client-side
    → Custom wagmi connector injects wallet
    → useAccount() returns { address, isConnected }
    → /fund page: Transak widget (card → USDC to address)

  Path B: "Connect Wallet" (unchanged)
    → RainbowKit modal (MetaMask / Coinbase / WalletConnect)
    → Existing wagmi flow
    → useAccount() returns { address, isConnected }

Both paths → identical wagmi state → rest of app works the same
```

## New Supabase Resources

### Table: `user_wallets`

```sql
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  chain_type TEXT NOT NULL DEFAULT 'evm',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, chain_type)
);
CREATE INDEX idx_user_wallets_user ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON user_wallets(address);
```

### Supabase Auth Configuration

Enable providers in Supabase Dashboard:
- Email (magic link + password)
- Google OAuth
- GitHub OAuth

RLS policy on `user_wallets`: users can only read/write their own rows (`auth.uid() = user_id`).

## New Files

### `src/lib/embedded-wallet.ts`

Core wallet operations (no React dependencies):

```typescript
generateWallet(): { address: string, privateKey: string }
  → viem generatePrivateKey() + privateKeyToAddress()

encryptKey(privateKey: string, authToken: string, userId: string): string
  → PBKDF2 key derivation (authToken + userId salt)
  → AES-256-GCM encrypt
  → return base64 encoded blob

decryptKey(encryptedBlob: string, authToken: string, userId: string): string
  → PBKDF2 key derivation
  → AES-256-GCM decrypt
  → return privateKey hex

storeWallet(supabase, userId, address, encryptedKey): Promise<void>
  → INSERT into user_wallets

loadWallet(supabase, userId): Promise<{ address, encryptedKey } | null>
  → SELECT from user_wallets WHERE user_id
```

### `src/hooks/useEmbeddedWallet.ts`

React hook bridging Supabase Auth and wallet:

```typescript
useEmbeddedWallet(): {
  isAuthenticated: boolean,
  isLoading: boolean,
  address: string | null,
  connect: () => Promise<void>,   // opens Supabase Auth UI
  disconnect: () => void,
  exportPrivateKey: () => string,  // for advanced users
}
```

State machine:
1. Check Supabase session on mount
2. If authenticated → load wallet from `user_wallets`
3. If no wallet → generate + encrypt + store → return address
4. If wallet exists → decrypt → return address
5. Expose wallet account to wagmi via custom connector

### `src/lib/wagmi-embedded-connector.ts`

Custom wagmi connector that wraps the embedded wallet:

```typescript
createEmbeddedConnector(privateKey): CreateConnectorFn
  → Creates a wagmi connector from a viem LocalAccount
  → Supports: getAccounts, connect, disconnect, getChainId, switchChain
  → Signs transactions using the decrypted private key in memory
```

This plugs into wagmi's `connect()` so `useAccount()`, `useSendTransaction()`, etc. all work.

### `src/components/AuthModal.tsx`

Modal with two tabs/options:
- "Sign in" — email/password or Google/GitHub buttons (Supabase Auth)
- "Connect Wallet" — triggers RainbowKit modal

Minimal custom UI, follows existing glass-card design.

## Modified Files

### `src/components/ConnectButton.tsx`

Currently wraps RainbowKit's ConnectButton. Add logic:
- If not connected via either method → show AuthModal
- If connected via embedded wallet → show address (from useEmbeddedWallet)
- If connected via RainbowKit → existing behavior

### `src/components/WalletInfo.tsx`

Add to dropdown menu:
- If embedded wallet: show "Export Private Key" option
- If embedded wallet: "Disconnect" calls Supabase signOut + wagmi disconnect
- Rest of dropdown (balance, My APIs, Fund Wallet, Switch Network) stays the same

### `src/pages/FundWallet.tsx` (or equivalent /fund page)

Add Transak widget section alongside existing Trails bridge:
- Tab or section: "Buy with Card" (Transak) | "Bridge from another chain" (Trails)
- Transak iframe/SDK with user's wallet address pre-filled
- Supported: Base USDC, Polygon USDC

### `src/main.tsx`

Add Supabase client initialization (if not already present).
No provider changes needed — RainbowKit stays, wagmi stays.

### `src/wagmi.ts`

No structural changes. The embedded connector is added dynamically at runtime when the user signs in, not at config time.

### `src/i18n/translations.ts`

New keys EN+FR:
- `auth.signIn`, `auth.signInWith`, `auth.email`, `auth.orConnectWallet`
- `auth.exportKey`, `auth.exportKeyWarning`
- `fund.buyWithCard`, `fund.transakTitle`, `fund.transakDesc`

## Security

| Concern | Mitigation |
|---------|-----------|
| Private key exposure | Never stored in plaintext. AES-256-GCM encrypted client-side. Server stores only ciphertext. |
| Encryption key compromise | Derived from auth token + user ID via PBKDF2. Token rotates on re-auth. |
| Supabase breach | Attacker gets encrypted blobs only. Useless without auth tokens. |
| XSS stealing key | Private key exists in memory only during active session. Same risk as MetaMask. |
| RLS bypass | `user_wallets` policy: `auth.uid() = user_id` on all operations. |
| Key export | User-initiated only, with warning dialog. Allows migration to MetaMask. |

## Transak Integration

- **Widget type:** Iframe embed on /fund page
- **API key:** Free to create at https://dashboard.transak.com
- **Config:** `cryptoCurrencyCode: 'USDC'`, `network: 'base'` or `'polygon'`, `walletAddress: <user's address>`
- **Cost to us:** Zero. Transak charges the buyer ~1-3% fee.
- **KYC:** Handled by Transak (not us). Required for card purchases > threshold.
- **Environment variable:** `VITE_TRANSAK_API_KEY`

## Testing Plan

1. Email sign up → wallet created → address visible → encrypted key in Supabase
2. Email sign in (return visit) → wallet decrypted → same address
3. Google OAuth → wallet created → same flow
4. MetaMask connect → RainbowKit flow unchanged → works as before
5. Embedded wallet: USDC balance display works
6. Embedded wallet: payment flow (Paywall.tsx) works — send USDC transaction
7. Embedded wallet: sign message works (register API)
8. Embedded wallet: chain switch works (SKALE, Base, Polygon)
9. Export private key → valid key → importable in MetaMask
10. Transak widget loads on /fund → user can initiate card purchase
11. Transak purchase completes → USDC arrives at wallet address
12. Both wallet types coexist — switch between embedded and external
13. Sign out (embedded) → session cleared → key not in memory
14. All existing 22 wagmi files still function correctly

## Files Summary

| File | Action |
|------|--------|
| `src/lib/embedded-wallet.ts` | NEW — wallet gen, encrypt, decrypt, store, load |
| `src/lib/wagmi-embedded-connector.ts` | NEW — custom wagmi connector for embedded wallet |
| `src/hooks/useEmbeddedWallet.ts` | NEW — React hook bridging Supabase Auth + wallet |
| `src/components/AuthModal.tsx` | NEW — sign in / connect wallet modal |
| `src/components/ConnectButton.tsx` | MODIFY — trigger AuthModal instead of just RainbowKit |
| `src/components/WalletInfo.tsx` | MODIFY — handle embedded wallet in dropdown |
| `src/pages/FundWallet.tsx` | MODIFY — add Transak widget section |
| `src/i18n/translations.ts` | MODIFY — new keys EN+FR |
| `src/main.tsx` | MODIFY — add Supabase client init |
| `migrations/026_user_wallets.sql` | NEW — Supabase table + RLS |

## Environment Variables

### Add
- `VITE_SUPABASE_URL` — Supabase project URL (already exists in backend, add to frontend)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key (safe for frontend)
- `VITE_TRANSAK_API_KEY` — from Transak dashboard (free)

### Keep
- `VITE_WALLETCONNECT_PROJECT_ID` — still used by RainbowKit
