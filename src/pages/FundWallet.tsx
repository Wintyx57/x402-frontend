import { lazy, Suspense, useState } from "react";
import { useTranslation } from "../i18n/LanguageContext";
import useSEO from "../hooks/useSEO";
import { useReveal } from "../hooks/useReveal";

const BridgeWidget = lazy(() => import("../components/BridgeWidget"));
const BuyWithCard = lazy(() => import("../components/BuyWithCard"));

function BridgeWidgetSkeleton() {
  return (
    <div
      className="max-w-lg mx-auto glass-card rounded-2xl p-5 space-y-3"
      aria-busy="true"
    >
      <div className="h-4 w-32 animate-shimmer rounded" />
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-8 w-20 animate-shimmer rounded-lg" />
        ))}
      </div>
      <div className="h-px bg-white/10" />
      <div className="h-4 w-16 animate-shimmer rounded" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-14 flex-1 animate-shimmer rounded-xl" />
        ))}
      </div>
      <div className="h-12 animate-shimmer rounded-xl" />
    </div>
  );
}

export default function FundWallet() {
  const { t } = useTranslation();
  const f = t.fund || ({} as Record<string, string>);
  const [activeTab, setActiveTab] = useState<"card" | "bridge">("card");

  useSEO({
    title: f.pageTitle || "Fund Your Wallet — Bridge USDC Cross-Chain",
    description:
      f.pageDescription ||
      "Bridge USDC from any chain to Base, SKALE, or Polygon in 1 click.",
    keywords:
      "bridge USDC, cross-chain, fund wallet, x402, SKALE, Base, Polygon",
  });

  const heroRef = useReveal();
  const widgetRef = useReveal();
  const howRef = useReveal();

  const steps = [
    {
      icon: "1",
      title: f.step1Title || "Choose Any Token",
      desc:
        f.step1Desc ||
        "Use any token from any chain. Trails finds the best route to USDC automatically.",
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: "2",
      title: f.step2Title || "One-Click Bridge",
      desc:
        f.step2Desc ||
        "Routes and bridges to your chosen destination — one transaction.",
      color: "from-[#FF9900]/20 to-[#FF9900]/5",
    },
    {
      icon: "3",
      title: f.step3Title || "USDC on Destination",
      desc:
        f.step3Desc || "USDC arrives on your chain. Ready for API payments.",
      color: "from-green-500/20 to-green-500/5",
    },
  ];

  const faqs = [
    {
      q: f.faqQ1 || "How long does the bridge take?",
      a:
        f.faqA1 ||
        "Depends on destination: Base ~1-2 min, SKALE 5-15 min (IMA bridge), Polygon ~2-5 min.",
    },
    {
      q: f.faqQ2 || "What tokens can I use?",
      a:
        f.faqA2 ||
        "Any token on Ethereum, Polygon, Optimism, Arbitrum, or Base. Trails finds the best route automatically.",
    },
    {
      q: f.faqQ3 || "Is there a minimum amount?",
      a:
        f.faqA3 ||
        "No minimum. Very small amounts may not be cost-effective due to gas fees.",
    },
    {
      q: f.faqQ4 || "What if the bridge fails?",
      a:
        f.faqA4 ||
        "Trails provides automatic refunds if the transaction fails on the source chain.",
    },
  ];

  return (
    <main className="min-h-screen animate-page-enter relative overflow-hidden">
      {/* ===== Hero glow (page-specific, more intense than global) ===== */}
      <div
        aria-hidden="true"
        className="absolute top-32 left-1/2 -translate-x-1/2
                   w-[800px] h-[600px] bg-[#FF9900]/15 rounded-full blur-[160px] animate-glow-pulse pointer-events-none"
      />

      {/* ===== Hero ===== */}
      <section
        ref={heroRef}
        className="reveal-section relative z-10 text-center py-8 sm:py-10 px-4"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full
                           bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] inline-block animate-pulse" />
              Powered by Trails
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full
                           bg-blue-500/10 border border-blue-500/20 text-blue-400"
            >
              Multi-Chain
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {f.heroTitle || "Fund Your Wallet"}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
            {f.heroSubtitle ||
              "Bridge USDC to Base, SKALE, or Polygon in 1 click. Pay for APIs with ultra-low gas."}
          </p>
        </div>
      </section>

      {/* ===== Tab Selector ===== */}
      <section className="relative z-10 px-4 pb-2">
        <div className="max-w-lg mx-auto flex gap-1 p-1 bg-white/5 rounded-xl">
          <button
            onClick={() => setActiveTab("card")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "card"
                ? "bg-[#FF9900] text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {f.buyWithCard || "Buy with Card"}
          </button>
          <button
            onClick={() => setActiveTab("bridge")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "bridge"
                ? "bg-[#FF9900] text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {f.bridgeTab || "Bridge Crypto"}
          </button>
        </div>
      </section>

      {/* ===== Tab Content ===== */}
      <section
        ref={widgetRef}
        className="reveal-section relative z-10 px-4 pb-6"
      >
        {activeTab === "card" ? (
          <div className="max-w-lg mx-auto glass-card rounded-2xl p-5">
            <Suspense fallback={<BridgeWidgetSkeleton />}>
              <BuyWithCard />
            </Suspense>
          </div>
        ) : (
          <Suspense fallback={<BridgeWidgetSkeleton />}>
            <BridgeWidget />
          </Suspense>
        )}
      </section>

      {/* ===== How it works ===== */}
      <section ref={howRef} className="reveal-section relative z-10 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            {f.howTitle || "How It Works"}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 text-center space-y-3 hover:border-[#FF9900]/20 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-b ${s.color} flex items-center justify-center`}
                >
                  <span className="text-[#FF9900] font-bold text-lg">
                    {s.icon}
                  </span>
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="relative z-10 px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            {f.faqTitle || "Frequently Asked Questions"}
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="glass-card rounded-xl p-4 group hover:border-[#FF9900]/20 transition-all duration-300"
              >
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <svg
                    className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
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
