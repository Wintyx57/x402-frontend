# Split Hero with Three.js USDC Tokens — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current hero section in Home.tsx with a split Provider/Agent hero featuring 3D USDC token particles rendered with Three.js, a portal center, and interactive hover takeover.

**Architecture:** The hero is split into 3 layers: (1) a Three.js canvas rendering USDC tokens with bloom post-processing as background, (2) an HTML overlay with two sides (Provider left / Agent right) using CSS mask-image for soft edges, and (3) a center zone with logo + live counter. The Three.js scene is encapsulated in a dedicated component `HeroScene.tsx` loaded via dynamic import for bundle splitting. All existing sections below the hero remain untouched.

**Tech Stack:** React 19, Three.js (new dependency), Vite 7, Tailwind v4, TypeScript

**Reference mockup:** `HACKATHON/hero-threejs-mockup.html` — the production prototype with all visual details.

---

### Task 1: Install Three.js and configure Vite chunking

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js:19-68` (manualChunks)

- [ ] **Step 1: Install three.js**

```bash
cd x402-frontend && npm install three && npm install -D @types/three
```

- [ ] **Step 2: Add vendor-three chunk to vite.config.js**

In `vite.config.js`, inside `manualChunks(id)`, add before the final return:

```javascript
if (id.includes('three'))
  return 'vendor-three';  // Three.js isolated for hero 3D scene
```

- [ ] **Step 3: Verify build still works**

```bash
cd x402-frontend && npm run build
```

Expected: Build succeeds with new `vendor-three` chunk in output.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vite.config.js
git commit -m "chore: add three.js dependency + vite chunk config"
```

---

### Task 2: Create HeroScene Three.js component

**Files:**
- Create: `src/components/HeroScene.tsx`

This is the core Three.js component. It renders the canvas with:
- USDC token particles (LatheGeometry beveled coins with canvas face texture)
- Portal ring (double torus) at center
- Bloom post-processing (UnrealBloomPass)
- Vignette + chromatic aberration shader
- Camera parallax following mouse
- Dust particles background
- Token funnel effect toward portal center
- Direction/speed changes based on hover state

- [ ] **Step 1: Create HeroScene.tsx**

Port the Three.js `<script type="module">` from `hero-threejs-mockup.html` into a React component:

```typescript
// src/components/HeroScene.tsx
import { useEffect, useRef } from 'react';

interface HeroSceneProps {
  hoverState: 'none' | 'provider' | 'agent';
}

export default function HeroScene({ hoverState }: HeroSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ hoverState, flowDir: -1 });

  // Keep ref in sync with props
  useEffect(() => {
    stateRef.current.hoverState = hoverState;
    stateRef.current.flowDir = hoverState === 'provider' ? 1 : -1;
  }, [hoverState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dynamic import three.js to ensure chunk splitting
    let disposed = false;
    import('three').then(async (THREE) => {
      if (disposed) return;
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      const { ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js');
      if (disposed) return;

      // === SETUP ===
      // Port all Three.js setup from mockup here:
      // renderer, scene, camera, lights, portal, tokens, dust, composer
      // See hero-threejs-mockup.html lines 166-501 for complete code
      // Key adaptations:
      // - Use stateRef.current.hoverState instead of hero.classList
      // - Use stateRef.current.flowDir instead of global flowDir
      // - Mouse tracking via document listeners (cleanup in return)
      // - All geometries/materials/textures stored for disposal

      // ... (full implementation from mockup)

      // === ANIMATE ===
      let animId: number;
      function animate() {
        animId = requestAnimationFrame(animate);
        if (prefersReducedMotion) { composer.render(); return; }
        // ... update tokens, portal, dust, camera
        composer.render();
      }
      animate();

      // Store cleanup ref
      cleanupRef.current = () => {
        cancelAnimationFrame(animId);
        // Dispose all geometries, materials, textures
        tokens.forEach(t => { /* dispose */ });
        renderer.dispose();
        composer.dispose();
      };
    });

    const cleanupRef = { current: () => {} };

    return () => {
      disposed = true;
      cleanupRef.current();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-[1]"
    />
  );
}
```

**IMPORTANT:** The complete Three.js code from the mockup (lines 166-501 of hero-threejs-mockup.html) must be ported exactly. This includes:
- `makeUSDCFace(512)` texture function with font loading
- `Token` class with LatheGeometry, CircleGeometry faces, glow sprite, trail buffer
- Portal double torus + glow sprite
- Funnel effect in token update
- Color blending by x position
- Portal pulse on crossing
- 300 dust particles
- Vignette+chromatic aberration shader
- All exact values (bloom 0.25/0.5/0.7, metalness 0.3, roughness 0.4, etc.)

- [ ] **Step 2: Verify component renders in isolation**

Temporarily add to Home.tsx to test:
```tsx
import HeroScene from '../components/HeroScene';
// In JSX: <HeroScene hoverState="none" />
```

```bash
cd x402-frontend && npm run dev
```

Expected: 3D tokens visible, no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroScene.tsx
git commit -m "feat: add HeroScene Three.js component with USDC tokens"
```

---

### Task 3: Create SplitHero component (HTML overlay)

**Files:**
- Create: `src/components/SplitHero.tsx`

This component renders the complete split hero overlay on top of HeroScene:
- Chain badges (SKALE, Base, Polygon) centered at top
- Provider side (left): title, desc, stats, CTA, reveal dashboard
- Agent side (right): title, desc, stats, CTA, reveal terminal
- Center zone: x402 logo + live counter
- Bottom bar: SKALE logo + tags
- Scroll hint
- Noise texture overlay

- [ ] **Step 1: Create SplitHero.tsx**

Port all HTML from hero-threejs-mockup.html body content. Use React state for hover:

```tsx
// src/components/SplitHero.tsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { usePublicStats } from '../hooks/usePublicStats';
import { trackEvent } from '../lib/analytics';

const HeroScene = lazy(() => import('./HeroScene'));

export default function SplitHero() {
  const [hoverState, setHoverState] = useState<'none' | 'provider' | 'agent'>('none');
  const { t } = useTranslation();
  const { data: stats } = usePublicStats();

  // Live counter
  const [txCount, setTxCount] = useState(2847);
  useEffect(() => {
    const interval = setInterval(() => {
      setTxCount(c => c + Math.floor(Math.random() * 3) + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen min-h-[800px] overflow-hidden">
      {/* Three.js canvas */}
      <Suspense fallback={null}>
        <HeroScene hoverState={hoverState} />
      </Suspense>

      {/* Noise */}
      <div aria-hidden="true" className="..." />

      {/* Chain badges */}
      <div className="absolute top-6 left-0 right-0 z-12 flex justify-center gap-2">
        {/* SKALE, Base, Polygon badges */}
      </div>

      {/* Provider side */}
      <div
        className={`side side-provider ${hoverState === 'provider' ? 'active' : ''} ${hoverState === 'agent' ? 'inactive' : ''}`}
        onMouseEnter={() => setHoverState('provider')}
        onMouseLeave={() => setHoverState('none')}
      >
        {/* Content from mockup */}
      </div>

      {/* Center zone */}
      <div className="center-zone">
        {/* x402 logo + live counter */}
      </div>

      {/* Agent side */}
      <div
        className={`side side-agent ...`}
        onMouseEnter={() => setHoverState('agent')}
        onMouseLeave={() => setHoverState('none')}
      >
        {/* Content from mockup */}
      </div>

      {/* Scroll hint */}
      {/* Bottom bar with SKALE logo */}
      {/* Gradient transition to page */}
    </section>
  );
}
```

**All CSS from the mockup's `<style>` block must be ported to either:**
- Tailwind utility classes (preferred for simple properties)
- A dedicated CSS module or section in `index.css` for complex animations/states

**Key CSS to port:**
- `.side` positioning, transitions, mask-image, hover states
- Word reveal animation (`@keyframes wr`)
- Gradient shift animation (`@keyframes gs`)
- Stat pill styles with pulsing dot
- CTA shimmer (optional, can be Tailwind)
- Reveal dashboard bars animation
- Terminal typing animation with cursor blink
- Chain badge styles
- Center zone + logo ring rotation
- Bottom bar glass style
- Mobile responsive rules
- `prefers-reduced-motion` rules

- [ ] **Step 2: Verify SplitHero renders correctly**

```bash
cd x402-frontend && npm run dev
```

Check: both sides visible, hover works, reveal boxes appear, animations play.

- [ ] **Step 3: Commit**

```bash
git add src/components/SplitHero.tsx src/index.css
git commit -m "feat: add SplitHero component with split layout and reveal boxes"
```

---

### Task 4: Add i18n keys for split hero

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add new translation keys**

Add to both EN and FR sections under `home:`:

```typescript
// English
heroProviderLabel: "For Providers",
heroProviderTitle1: "Monetize",
heroProviderTitle2: "any API",
heroProviderTitle3: "in 2 min.",
heroProviderDesc: "No SDK. No code change. Wrap your endpoint and start earning USDC on every call.",
heroProviderStat1: "103 APIs",
heroProviderStat2: "95% revenue",
heroProviderCta: "List your API",
heroProviderRevealTitle: "AES-256 encrypted credentials",
heroProviderRevealDesc: "— list authenticated APIs securely. Keys decrypted only at request time.",
heroProviderRevealHighlight: "95%",
heroProviderRevealEnd: "revenue goes to you.",
heroProviderRevenue: "Monthly revenue",
heroAgentLabel: "For AI Agents",
heroAgentTitle1: "Pay and go.",
heroAgentTitle2: "No keys.",
heroAgentTitle3: "No subscriptions.",
heroAgentDesc: "Discover APIs, pay in USDC per call, get instant results. One HTTP request.",
heroAgentStat1: "$0.00 gas",
heroAgentStat2: "3 chains",
heroAgentCta: "Browse APIs",
heroTxnsLabel: "txns on SKALE",

// French
heroProviderLabel: "Pour les Fournisseurs",
heroProviderTitle1: "Monétisez",
heroProviderTitle2: "toute API",
heroProviderTitle3: "en 2 min.",
heroProviderDesc: "Pas de SDK. Pas de code à changer. Wrappez votre endpoint et gagnez des USDC à chaque appel.",
heroProviderStat1: "103 APIs",
heroProviderStat2: "95% revenus",
heroProviderCta: "Lister votre API",
// ... etc
```

- [ ] **Step 2: Update SplitHero to use i18n keys**

Replace all hardcoded strings with `t.home.heroProviderTitle1` etc.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.ts src/components/SplitHero.tsx
git commit -m "feat: add i18n keys for split hero (EN+FR)"
```

---

### Task 5: Replace hero in Home.tsx

**Files:**
- Modify: `src/pages/Home.tsx:1-15` (imports)
- Modify: `src/pages/Home.tsx:296-439` (replace hero section)

- [ ] **Step 1: Add SplitHero import**

At top of Home.tsx, add:
```tsx
import SplitHero from '../components/SplitHero';
```

Remove unused imports if the old hero used components not needed elsewhere (FloatingGrid, some SVG icons only used in hero).

- [ ] **Step 2: Replace hero section**

Replace lines 296-439 (the entire `{/* ===== HERO ===== */}` section) with:

```tsx
{/* ===== HERO ===== */}
<SplitHero />
```

Keep everything below the hero (How it Works, Value Props, etc.) exactly as-is.

- [ ] **Step 3: Remove the old hero video**

The old hero used `/hero-1.mp4`. If it's not used elsewhere, note it for potential cleanup later (don't delete yet — it may be referenced in other pages).

- [ ] **Step 4: Clean up unused code**

Remove `FloatingGrid` component from Home.tsx if it was only used in the hero. Remove unused icon SVGs. Keep `CountUp`, `IntegrationBadge`, and all other components used by sections below.

- [ ] **Step 5: Verify full page works**

```bash
cd x402-frontend && npm run dev
```

Check:
- New split hero renders
- Hover provider/agent works
- Three.js tokens visible
- Scroll down: How it Works, Value Props, etc. all still work
- Mobile: stacked layout, no Three.js canvas
- i18n toggle: FR/EN switches hero text

- [ ] **Step 6: Build check**

```bash
cd x402-frontend && npm run build
```

Expected: Build succeeds, `vendor-three` chunk in output, total bundle size reasonable.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Home.tsx src/components/SplitHero.tsx
git commit -m "feat: replace hero with split Provider/Agent layout + Three.js USDC tokens"
```

---

### Task 6: Production verification and push

**Files:** None (testing + deploy)

- [ ] **Step 1: Run dev server and test all interactions**

```bash
cd x402-frontend && npm run dev
```

Checklist:
- [ ] Split hero renders with Two sides
- [ ] Hover provider: side expands, content centers, agent side blurs
- [ ] Hover agent: side expands, content centers, provider side blurs
- [ ] Three.js tokens flow and change direction on hover
- [ ] Tokens funnel through portal at center
- [ ] Portal pulses when tokens pass
- [ ] Camera parallax follows mouse
- [ ] Chain badges centered at top
- [ ] SKALE logo + bottom bar centered at bottom
- [ ] Reveal: provider shows revenue dashboard with animated bars
- [ ] Reveal: agent shows terminal with typing animation
- [ ] Live counter increments
- [ ] Word reveal animation on page load
- [ ] Mobile: stacked layout, all content visible, no Three.js
- [ ] FR/EN toggle works
- [ ] Scroll to rest of page works normally
- [ ] No console errors
- [ ] prefers-reduced-motion: animations disabled

- [ ] **Step 2: Build and verify bundle**

```bash
cd x402-frontend && npm run build
ls -la dist/assets/ | grep vendor-three
```

Expected: `vendor-three` chunk exists, under 500KB gzip.

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "feat: split hero with Three.js USDC tokens — complete implementation"
git push origin main
```

Expected: Vercel auto-deploys. Verify on x402bazaar.org.

- [ ] **Step 4: Verify production**

Open https://x402bazaar.org and check all interactions work on the live site.
