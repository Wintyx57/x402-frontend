# Register Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Register page with a 3D carousel hub, aurora background, progressive disclosure form, and aligned glassmorphism design — while preserving 100% of existing functionality.

**Architecture:** Replace the current 1530-line Register.tsx with a modular structure: a main RegisterHub page with a 3D carousel, 4 form panels as separate components, shared sub-components (AuroraBackground, Carousel3D, StepTabs), and dynamic stats from API. Quick + Full register are merged into a single "List Your API" flow with progressive disclosure. OpenAPI/RapidAPI cards navigate to existing pages. Payment Links form is inline.

**Tech Stack:** React 18, TypeScript, Tailwind v4, wagmi, viem, i18n (LanguageContext), CSS animations + transforms (no external animation libs)

**Prototype reference:** `register-prototype.html` in the project root — this is the visual target.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/pages/Register.tsx` | **Rewrite** | Main hub: hero, carousel, form panel switching, stats |
| `src/components/register/AuroraBackground.tsx` | **Create** | Aurora blobs + dot grid + vignette + noise overlay |
| `src/components/register/Carousel3D.tsx` | **Create** | 3D carousel with 4 cards, auto-rotate on hover, dot nav |
| `src/components/register/CarouselCard.tsx` | **Create** | Individual card with 3D CSS object (cube/docs/bolt/chain) |
| `src/components/register/CompactTabs.tsx` | **Create** | Compact tab bar shown after card selection |
| `src/components/register/ListApiForm.tsx` | **Create** | Merged Quick+Full form with progressive disclosure |
| `src/components/register/PaymentLinkForm.tsx` | **Create** | Payment link creation form (extracted from Register.tsx) |
| `src/components/register/OpenApiPanel.tsx` | **Create** | CTA panel that navigates to /import |
| `src/components/register/RapidApiPanel.tsx` | **Create** | CTA panel that navigates to /import/rapidapi |
| `src/components/register/RevenueHint.tsx` | **Create** | Revenue calculation hint box |
| `src/i18n/translations.js` | **Modify** | Add new keys for carousel cards, remove unused full/quick labels |
| `src/index.css` | **Modify** | Add aurora animations + carousel 3D styles |

---

## Task 1: Aurora Background Component

**Files:**
- Create: `src/components/register/AuroraBackground.tsx`
- Modify: `src/index.css` (add aurora keyframes)

- [ ] **Step 1: Create the component file**

```tsx
// src/components/register/AuroraBackground.tsx
export default function AuroraBackground() {
  return (
    <>
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
        <div className="aurora-grid" />
      </div>
      <div className="aurora-vignette" aria-hidden="true" />
    </>
  )
}
```

- [ ] **Step 2: Add CSS to index.css**

Add the aurora styles from the prototype (`register-prototype.html`) to `src/index.css`:
- `.aurora-bg` — fixed, inset 0, overflow hidden, z-index 0
- `.aurora-blob` — absolute, border-radius 50%, filter blur(100px), radial-gradient backgrounds
- 4 blob variants with colors: orange (0.30 opacity), blue (0.25), purple (0.22), green (0.18)
- 4 drift keyframes (`auroraDrift1-4`) — 22-30s alternate infinite
- `.aurora-grid` — radial-gradient dot pattern 28px spacing, 0.04 opacity
- `.aurora-vignette` — radial-gradient from transparent to bg color
- Noise texture pseudo-element (SVG fractal noise at 0.03 opacity)
- `@media (prefers-reduced-motion)` — disable all aurora animations

- [ ] **Step 3: Verify it renders**

Import in Register.tsx temporarily:
```tsx
import AuroraBackground from '../components/register/AuroraBackground'
// Add <AuroraBackground /> at top of JSX
```

Run: `npm run dev` and visually confirm aurora renders behind content.

- [ ] **Step 4: Commit**

```bash
git add src/components/register/AuroraBackground.tsx src/index.css
git commit -m "feat(register): add aurora background component"
```

---

## Task 2: 3D Carousel Card Component

**Files:**
- Create: `src/components/register/CarouselCard.tsx`
- Modify: `src/index.css` (add 3D object keyframes)

- [ ] **Step 1: Define the card props and 3D objects**

```tsx
// src/components/register/CarouselCard.tsx
interface CarouselCardProps {
  index: number
  title: string
  description: string
  badge: string
  color: 'green' | 'orange' | 'blue' | 'purple'
  isActive: boolean
  style: React.CSSProperties
  onClick: () => void
}
```

Each card renders a unique 3D CSS object based on `index`:
- 0: Rotating cube with "+" on faces (CSS `transform-style: preserve-3d`, 6 faces)
- 1: 3 stacked floating document layers (rotateX perspective)
- 2: Lightning bolt SVG with pulsing rings
- 3: 3 interlocking chain links

- [ ] **Step 2: Implement the component**

Implement `CarouselCard` with:
- Glass card styling (gradient bg, border, backdrop-filter)
- `card-scene` div for 3D object
- `card-text` div for title (gradient text per color), description, badge
- Active state: box-shadow glow, higher opacity
- Inactive state: blur(1.5px), opacity 0.4
- Top highlight line (pseudo-element)
- Title uses `-webkit-background-clip: text` gradient (white to card color)

Copy the 3D object CSS from prototype: `.obj-cube`, `.obj-docs`, `.obj-bolt`, `.obj-chain` and their keyframes to `index.css`.

- [ ] **Step 3: Commit**

```bash
git add src/components/register/CarouselCard.tsx src/index.css
git commit -m "feat(register): add 3D carousel card component"
```

---

## Task 3: Carousel3D Component

**Files:**
- Create: `src/components/register/Carousel3D.tsx`

- [ ] **Step 1: Implement carousel logic**

```tsx
// src/components/register/Carousel3D.tsx
interface Carousel3DProps {
  cards: Array<{ title: string; description: string; badge: string; color: 'green'|'orange'|'blue'|'purple' }>
  currentIndex: number
  onSelect: (index: number) => void
  onNavigate: (dir: number) => void
}
```

Logic from prototype:
- `perspective: 1400px` container
- Position cards on a circle: `translateX(sin * 310) translateZ(cos * 310 - 310) scale()`
- Arrow buttons (left/right)
- Dot navigation
- Auto-rotate on hover (3s interval), stop on leave
- CSS transitions: `0.8s cubic-bezier(0.23, 1, 0.32, 1)`

- [ ] **Step 2: Add compact mode**

When `isCompact` prop is true:
- Container height 0, opacity 0, pointer-events none
- Smooth transition (0.5s)

- [ ] **Step 3: Commit**

```bash
git add src/components/register/Carousel3D.tsx
git commit -m "feat(register): add 3D carousel component"
```

---

## Task 4: CompactTabs Component

**Files:**
- Create: `src/components/register/CompactTabs.tsx`

- [ ] **Step 1: Implement compact tabs**

```tsx
// src/components/register/CompactTabs.tsx
interface CompactTabsProps {
  tabs: Array<{ label: string; color: string }>
  activeIndex: number
  onSelect: (index: number) => void
  visible: boolean
}
```

Renders horizontal pill tabs with color dots, active state with accent border. Hidden when `visible=false` via CSS transition.

- [ ] **Step 2: Commit**

```bash
git add src/components/register/CompactTabs.tsx
git commit -m "feat(register): add compact tabs component"
```

---

## Task 5: ListApiForm (Merged Quick + Full)

**Files:**
- Create: `src/components/register/ListApiForm.tsx`

This is the most complex component — it merges Quick Register and Full Register into one progressive disclosure form.

- [ ] **Step 1: Define state and props**

```tsx
interface ListApiFormProps {
  onBack: () => void
}
```

Internal state from both Quick and Full:
- `url`, `price`, `wallet` (required, always visible)
- `name`, `description`, `category`, `method`, `tags`, `requiredParams`, `freeCallsPerMonth` (in expandable "Customize" section)
- `showCredentials`, `credentialType`, `credentialItems` (in expandable section)
- `loading`, `result`, `error`
- Wallet auto-fill from `useAccount()`

- [ ] **Step 2: Implement the form JSX**

Layout:
1. Back button
2. Glass card with:
   - Title "List Your API" with green dot
   - Subtitle
   - Required fields: URL, Price (with presets + USDC suffix), Wallet (with "Use Connected" button)
   - Expand toggle "Customize (name, tags, credentials...)"
   - Expandable section: Name, Description, Category (select), Tags, Method toggle, Required Params, Free Calls, CredentialsSection component
   - Submit button "List My API" (green gradient)
   - RevenueHint component below
3. Success screen (same as current quick/full success, with credential validation status, proxy URL, EmbedSnippet)

- [ ] **Step 3: Implement handlers**

Port from Register.tsx:
- `handleSubmit()` — combines quick-register logic: validate, sign message (`quick-register:${url}:${wallet}:${timestamp}`), POST `/quick-register`, handle credentials
- `validateForm()` — URL format, price range, wallet format
- Price preset click handler
- "Use Connected" wallet auto-fill

If advanced fields are filled (name, description, tags, category), use `batch-register` endpoint instead (single service) for richer registration.

- [ ] **Step 4: Implement success screen**

Port the success screen with:
- Green checkmark
- Credential validation badge (warning/valid)
- Revenue breakdown (3-column: live, discoverable, 95% USDC)
- View TX link, View services link
- Register Another button (resets form)

- [ ] **Step 5: Commit**

```bash
git add src/components/register/ListApiForm.tsx
git commit -m "feat(register): add merged ListApiForm with progressive disclosure"
```

---

## Task 6: PaymentLinkForm + CTA Panels

**Files:**
- Create: `src/components/register/PaymentLinkForm.tsx`
- Create: `src/components/register/OpenApiPanel.tsx`
- Create: `src/components/register/RapidApiPanel.tsx`
- Create: `src/components/register/RevenueHint.tsx`

- [ ] **Step 1: PaymentLinkForm**

Extract payment link form from Register.tsx lines ~1370-1530:
- Title, Description, Target URL, Price (with presets), Wallet
- Submit handler: sign + POST `/api/payment-links`
- Success screen with shareable link, copy button
- Props: `onBack: () => void`

- [ ] **Step 2: OpenApiPanel and RapidApiPanel**

Simple CTA panels (not full forms — they navigate to existing pages):

```tsx
// OpenApiPanel.tsx
export default function OpenApiPanel({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="form-panel">
      <BackButton onClick={onBack} />
      <div className="form-card text-center py-16">
        {/* Icon, title, description, button that navigates to /import */}
        <button onClick={() => navigate('/import')} className="btn-orange">
          Upload Spec File
        </button>
        <p>Supports JSON and YAML - OpenAPI 3.x & Swagger 2.0</p>
      </div>
    </div>
  )
}
```

RapidApiPanel same pattern but navigates to `/import/rapidapi`.

- [ ] **Step 3: RevenueHint**

```tsx
// RevenueHint.tsx
interface RevenueHintProps { price: number }
// Calculate: price * 100 calls/day * 30 days * 0.95 = monthly revenue
// Render hint box with SVG dollar icon (no emoji)
```

- [ ] **Step 4: Commit**

```bash
git add src/components/register/PaymentLinkForm.tsx src/components/register/OpenApiPanel.tsx src/components/register/RapidApiPanel.tsx src/components/register/RevenueHint.tsx
git commit -m "feat(register): add PaymentLinkForm, CTA panels, RevenueHint"
```

---

## Task 7: Rewrite Register.tsx (Main Hub)

**Files:**
- Rewrite: `src/pages/Register.tsx`

- [ ] **Step 1: Write the new Register.tsx**

The hub orchestrates everything:

```tsx
import { useState } from 'react'
import useSEO from '../hooks/useSEO'
import { useTranslation } from '../i18n/LanguageContext'
import { API_URL } from '../config'
import AuroraBackground from '../components/register/AuroraBackground'
import Carousel3D from '../components/register/Carousel3D'
import CompactTabs from '../components/register/CompactTabs'
import ListApiForm from '../components/register/ListApiForm'
import OpenApiPanel from '../components/register/OpenApiPanel'
import RapidApiPanel from '../components/register/RapidApiPanel'
import PaymentLinkForm from '../components/register/PaymentLinkForm'
```

State:
```tsx
const [selectedCard, setSelectedCard] = useState<number | null>(null)
const [currentIndex, setCurrentIndex] = useState(0)
const [stats, setStats] = useState({ totalServices: '--', totalPayments: '--' })
```

useEffect: fetch `/api/public-stats` on mount for dynamic stats.

JSX structure:
1. `<AuroraBackground />`
2. Hero section (badge, title with depth layers + light sweep, subtitle)
3. `<Carousel3D>` with 4 cards (visible when `selectedCard === null`)
4. `<CompactTabs>` (visible when `selectedCard !== null`)
5. Form panels (conditionally rendered based on `selectedCard`):
   - 0: `<ListApiForm onBack={backToCarousel} />`
   - 1: `<OpenApiPanel onBack={backToCarousel} />`
   - 2: `<RapidApiPanel onBack={backToCarousel} />`
   - 3: `<PaymentLinkForm onBack={backToCarousel} />`
6. Stats bar (dynamic: APIs listed, 95% revenue, 3 chains, total payments)

Title depth effect: 3 shadow divs behind h1 with `-webkit-text-stroke` offsets + animated light sweep pseudo-element.

- [ ] **Step 2: Wire up card definitions**

```tsx
const CARDS = [
  { title: t.register?.listApi || 'List Your API', description: '...', badge: '~ 30 sec', color: 'green' as const },
  { title: t.register?.importOpenapi || 'Import OpenAPI', description: '...', badge: 'Bulk import', color: 'orange' as const },
  { title: t.register?.fromRapidapi || 'From RapidAPI', description: '...', badge: '1-click', color: 'blue' as const },
  { title: t.register?.paymentLinks || 'Payment Links', description: '...', badge: 'Paywall', color: 'purple' as const },
]
```

- [ ] **Step 3: Implement selectCard and backToCarousel handlers**

```tsx
function selectCard(index: number) {
  setSelectedCard(index)
  setCurrentIndex(index)
}
function backToCarousel() {
  setSelectedCard(null)
}
function switchTab(index: number) {
  setSelectedCard(index)
  setCurrentIndex(index)
}
```

- [ ] **Step 4: Verify all functionality preserved**

Checklist:
- [ ] Quick register flow (URL + price + wallet → submit → success)
- [ ] Full register fields available via "Customize" expand
- [ ] Credentials section works (bearer, header, basic, query)
- [ ] Payment link creation works
- [ ] OpenAPI card navigates to /import
- [ ] RapidAPI card navigates to /import/rapidapi
- [ ] Stats fetch from API
- [ ] Wallet auto-fill
- [ ] i18n works (EN + FR)
- [ ] SEO meta tags
- [ ] Analytics tracking
- [ ] Carousel 3D rotation on hover
- [ ] Compact tabs after selection
- [ ] Back to carousel works
- [ ] Success screens with credential validation
- [ ] EmbedSnippet on success

- [ ] **Step 5: Commit**

```bash
git add src/pages/Register.tsx
git commit -m "feat(register): redesign with 3D carousel hub and progressive disclosure"
```

---

## Task 8: i18n Updates

**Files:**
- Modify: `src/i18n/translations.js`

- [ ] **Step 1: Add new translation keys**

Add to both EN and FR sections:

```javascript
// New keys for carousel cards
listApi: 'List Your API',           // FR: 'Lister Votre API'
importOpenapi: 'Import OpenAPI',    // FR: 'Importer OpenAPI'
fromRapidapi: 'From RapidAPI',      // FR: 'Depuis RapidAPI'
listApiDesc: 'Paste your URL, set a price, and start earning.',
importOpenapiDesc: 'Upload your spec and import all endpoints at once.',
fromRapidapiDesc: 'Migrate in one click. Credentials auto-configured.',
paymentLinksDesc: 'Paywall any URL. Share a link, get paid in USDC.',
backToOptions: 'Back to options',
customize: 'Customize (name, tags, credentials...)',
apisListed: 'APIs listed',
revenueToYou: 'Revenue to you',
chainsSupported: 'Chains supported',
totalPayments: 'Total payments',
```

- [ ] **Step 2: Commit**

```bash
git add src/i18n/translations.js
git commit -m "feat(i18n): add register redesign translation keys"
```

---

## Task 9: Build Verification + Visual QA

- [ ] **Step 1: Run build**

```bash
cd x402-frontend && npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Run dev server and visual QA**

```bash
npm run dev
```

Open http://localhost:5173/register and verify:
- Aurora background renders with animated blobs
- 3D carousel displays 4 cards with rotating objects
- Hover triggers auto-rotation
- Click on card shows compact tabs + form
- List API form works end-to-end (submit to backend)
- Payment Links form works
- OpenAPI/RapidAPI cards navigate correctly
- Stats load from API
- Mobile responsive
- FR/EN toggle works

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "feat(register): complete redesign with 3D carousel, aurora bg, progressive disclosure"
git push origin main
```

---

## Task 10: Cleanup

- [ ] **Step 1: Remove prototype file**

```bash
rm register-prototype.html
```

- [ ] **Step 2: Verify on production**

After Vercel auto-deploy, check https://x402bazaar.org/register

- [ ] **Step 3: Final commit if needed**

```bash
git add -A && git commit -m "chore: cleanup prototype files"
git push origin main
```
