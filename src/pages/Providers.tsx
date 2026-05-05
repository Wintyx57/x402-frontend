import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import useSEO from "../hooks/useSEO";

// ---------------------------------------------------------------------------
// Reusable components
// ---------------------------------------------------------------------------

function CheckIcon({
  className = "w-4 h-4 text-[#34D399]",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="w-4 h-4 text-red-400/50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 flex flex-col items-center">
        <div
          className="w-9 h-9 rounded-full gradient-btn text-white text-sm font-bold flex items-center justify-center"
          aria-hidden="true"
        >
          {number}
        </div>
        <div
          className="w-px flex-1 bg-gradient-to-b from-[#FF9900]/30 to-transparent mt-2"
          aria-hidden="true"
        />
      </div>
      <div className="pb-8">
        <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl p-5 flex gap-4 hover:bg-white/[0.04] transition-all duration-200">
      <div
        className="w-10 h-10 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FAQItem({
  question,
  answer,
  id,
}: {
  question: string;
  answer: string;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `provider-faq-${id}`;

  return (
    <div
      className={`glass-card rounded-xl transition-all duration-200 ${open ? "border-[#FF9900]/20" : ""} hover:bg-white/[0.04]`}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 cursor-pointer bg-transparent border-none"
      >
        <h3 className="text-white font-medium text-sm flex-1">{question}</h3>
        <svg
          className={`w-5 h-5 text-[#FF9900] shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        id={panelId}
        role="region"
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 px-5 pb-5" : "max-h-0"}`}
      >
        <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature icons — inline SVGs
// ---------------------------------------------------------------------------
function ChartIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#FF9900]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}
function BadgeIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#FF9900]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}
function FingerprintIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#FF9900]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#FF9900]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}
function CoinIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#FF9900]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function RefundIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#FF9900]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Chain badge
// ---------------------------------------------------------------------------
const CHAIN_COLORS: Record<string, string> = {
  Base: "text-[#0052FF] bg-[#0052FF]/10 border-[#0052FF]/20",
  SKALE: "text-[#34D399] bg-[#34D399]/10 border-[#34D399]/20",
  Polygon: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

function ChainBadge({ chain }: { chain: string }) {
  const color =
    CHAIN_COLORS[chain] ?? "text-gray-400 bg-white/5 border-white/10";
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}
    >
      {chain}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Providers() {
  const { t } = useTranslation();
  const p = t.providers;

  useSEO({
    title: "For API Providers",
    description:
      "Sell your API to AI agents on x402 Bazaar. Keep 95% of revenue, get paid in USDC instantly, no listing fees, no 30-day terms. Register in 5 minutes.",
    keywords:
      "API monetization, sell API USDC, API provider marketplace, 95% revenue share API, instant USDC payout, AI agent API marketplace, x402 provider",
  });

  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();
  const ref5 = useReveal();
  const ref6 = useReveal();

  // JSON-LD: Service listing offer
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "x402 Bazaar — API Provider Program",
      description:
        "List your API on x402 Bazaar and earn 95% of every payment in USDC. No listing fee, no monthly fee, instant payouts.",
      url: "https://x402bazaar.org/providers",
      provider: {
        "@type": "Organization",
        name: "x402 Bazaar",
        url: "https://x402bazaar.org",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free to list. 5% platform fee on successful calls only.",
      },
      audience: {
        "@type": "Audience",
        audienceType: "API developers, SaaS providers, data providers",
      },
    };
    let script = document.getElementById(
      "providers-jsonld",
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "providers-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
    return () => {
      document.getElementById("providers-jsonld")?.remove();
    };
  }, []);

  const features = [
    { title: p.feat1Title, desc: p.feat1Desc, icon: <ChartIcon /> },
    { title: p.feat2Title, desc: p.feat2Desc, icon: <BadgeIcon /> },
    { title: p.feat3Title, desc: p.feat3Desc, icon: <FingerprintIcon /> },
    { title: p.feat4Title, desc: p.feat4Desc, icon: <ShieldIcon /> },
    { title: p.feat5Title, desc: p.feat5Desc, icon: <CoinIcon /> },
    { title: p.feat6Title, desc: p.feat6Desc, icon: <RefundIcon /> },
  ];

  const topEarners = [
    {
      name: p.earner1Name,
      revenue: p.earner1Revenue,
      calls: p.earner1Calls,
      chain: p.earner1Chain,
    },
    {
      name: p.earner2Name,
      revenue: p.earner2Revenue,
      calls: p.earner2Calls,
      chain: p.earner2Chain,
    },
    {
      name: p.earner3Name,
      revenue: p.earner3Revenue,
      calls: p.earner3Calls,
      chain: p.earner3Chain,
    },
    {
      name: p.earner4Name,
      revenue: p.earner4Revenue,
      calls: p.earner4Calls,
      chain: p.earner4Chain,
    },
    {
      name: p.earner5Name,
      revenue: p.earner5Revenue,
      calls: p.earner5Calls,
      chain: p.earner5Chain,
    },
  ];

  const faqItems = [
    { q: p.faq1Q, a: p.faq1A, id: "1" },
    { q: p.faq2Q, a: p.faq2A, id: "2" },
    { q: p.faq3Q, a: p.faq3A, id: "3" },
    { q: p.faq4Q, a: p.faq4A, id: "4" },
    { q: p.faq5Q, a: p.faq5A, id: "5" },
    { q: p.faq6Q, a: p.faq6A, id: "6" },
    { q: p.faq7Q, a: p.faq7A, id: "7" },
    { q: p.faq8Q, a: p.faq8A, id: "8" },
  ];

  const compRows = [
    {
      label: p.compRow1,
      x402: p.compRow1X402,
      rapid: p.compRow1Rapid,
      highlight: true,
    },
    {
      label: p.compRow2,
      x402: p.compRow2X402,
      rapid: p.compRow2Rapid,
      highlight: true,
    },
    {
      label: p.compRow3,
      x402: p.compRow3X402,
      rapid: p.compRow3Rapid,
      highlight: false,
    },
    {
      label: p.compRow4,
      x402: p.compRow4X402,
      rapid: p.compRow4Rapid,
      highlight: false,
    },
    {
      label: p.compRow5,
      x402: p.compRow5X402,
      rapid: p.compRow5Rapid,
      highlight: false,
    },
  ];

  const howSteps = [
    { title: p.how1Title, desc: p.how1Desc },
    { title: p.how2Title, desc: p.how2Desc },
    { title: p.how3Title, desc: p.how3Desc },
    { title: p.how4Title, desc: p.how4Desc },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* ------------------------------------------------------------------ */}
      {/* Hero */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={ref1}
        className="reveal text-center mb-16"
        aria-labelledby="providers-title"
      >
        <span className="inline-block text-xs font-bold text-[#FF9900] bg-[#FF9900]/10 border border-[#FF9900]/20 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
          {p.badge}
        </span>
        <h1
          id="providers-title"
          className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4"
        >
          {p.heroTitle}
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
          {p.heroSubtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="gradient-btn text-white text-sm font-semibold px-6 py-2.5 rounded-xl no-underline hover:brightness-110 transition-all duration-200"
          >
            {p.heroCtaRegister}
          </Link>
          <Link
            to="/docs"
            className="glass text-white text-sm font-medium px-6 py-2.5 rounded-xl no-underline hover:bg-white/[0.08] transition-all duration-200"
          >
            {p.heroCtaDocs}
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Why section — differentiators + comparison table */}
      {/* ------------------------------------------------------------------ */}
      <section ref={ref2} className="reveal mb-16" aria-labelledby="why-title">
        <div className="text-center mb-8">
          <h2 id="why-title" className="text-2xl font-bold text-white mb-2">
            {p.whyTitle}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            {p.whySubtitle}
          </p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="text-center p-4 border-b border-white/8">
            <h3 className="text-sm font-semibold text-gray-400">
              {p.comparisonTitle}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label={p.comparisonTitle}>
              <thead>
                <tr className="border-b border-white/8">
                  <th
                    scope="col"
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-1/3"
                  >
                    {p.compHeaderFeature}
                  </th>
                  <th
                    scope="col"
                    className="text-center px-5 py-3 text-xs font-semibold text-[#FF9900] uppercase tracking-wide"
                  >
                    {p.compHeaderX402}
                  </th>
                  <th
                    scope="col"
                    className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {p.compHeaderRapid}
                  </th>
                </tr>
              </thead>
              <tbody>
                {compRows.map((row, idx) => {
                  const isYesNo =
                    (row.x402 === "Yes" || row.x402 === "Oui") &&
                    (row.rapid === "No" || row.rapid === "Non");
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-white/5 last:border-b-0 ${row.highlight ? "bg-[#FF9900]/[0.03]" : ""}`}
                    >
                      <td className="px-5 py-3.5 text-gray-300 font-medium text-sm">
                        {row.label}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isYesNo ? (
                          <span className="inline-flex items-center justify-center">
                            <CheckIcon className="w-5 h-5 text-[#34D399]" />
                          </span>
                        ) : (
                          <span
                            className={`font-bold text-sm ${row.highlight ? "text-[#FF9900]" : "text-white"}`}
                          >
                            {row.x402}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isYesNo ? (
                          <span className="inline-flex items-center justify-center">
                            <CrossIcon />
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {row.rapid}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How it works — 4-step visual flow */}
      {/* ------------------------------------------------------------------ */}
      <section ref={ref3} className="reveal mb-16" aria-labelledby="how-title">
        <div className="text-center mb-8">
          <h2 id="how-title" className="text-2xl font-bold text-white mb-2">
            {p.howTitle}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            {p.howSubtitle}
          </p>
        </div>
        <div className="max-w-xl mx-auto" role="list" aria-label={p.howTitle}>
          {howSteps.map((step, idx) => (
            <div key={idx} role="listitem">
              <StepCard
                number={String(idx + 1)}
                title={step.title}
                description={step.desc}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* What you get — feature grid */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={ref4}
        className="reveal mb-16"
        aria-labelledby="features-title"
      >
        <div className="text-center mb-8">
          <h2
            id="features-title"
            className="text-2xl font-bold text-white mb-2"
          >
            {p.featuresTitle}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            {p.featuresSubtitle}
          </p>
        </div>
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label={p.featuresTitle}
        >
          {features.map((feat) => (
            <div key={feat.title} role="listitem">
              <FeatureCard
                title={feat.title}
                description={feat.desc}
                icon={feat.icon}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Top earners */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={ref5}
        className="reveal mb-16"
        aria-labelledby="earners-title"
      >
        <div className="text-center mb-8">
          <h2 id="earners-title" className="text-2xl font-bold text-white mb-2">
            {p.topEarnersTitle}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            {p.topEarnersSubtitle}
          </p>
        </div>
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label={p.topEarnersTitle}
        >
          {topEarners.map((earner, idx) => (
            <div
              key={earner.name}
              role="listitem"
              className={`glass-card rounded-xl p-5 relative overflow-hidden ${idx === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              {/* Rank badge */}
              <span
                className="absolute top-3 right-3 text-[10px] font-bold text-gray-600"
                aria-label={`Rank ${idx + 1}`}
              >
                #{idx + 1}
              </span>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-white font-semibold text-sm leading-snug">
                  {earner.name}
                </h3>
                <ChainBadge chain={earner.chain} />
              </div>
              <p className="text-[#FF9900] font-bold text-xl mb-1">
                {earner.revenue}
              </p>
              <p className="text-gray-500 text-xs">{earner.calls}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-600 mt-3">
          * Revenue figures are illustrative estimates based on current platform
          activity.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ accordion */}
      {/* ------------------------------------------------------------------ */}
      <section ref={ref6} className="reveal mb-16" aria-labelledby="faq-title">
        <div className="text-center mb-8">
          <h2 id="faq-title" className="text-2xl font-bold text-white mb-2">
            {p.faqTitle}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            {p.faqSubtitle}
          </p>
        </div>
        <div className="space-y-3 max-w-3xl mx-auto">
          {faqItems.map((item) => (
            <FAQItem
              key={item.id}
              id={item.id}
              question={item.q}
              answer={item.a}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA footer */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="gradient-cta rounded-2xl p-10 text-center"
        aria-labelledby="providers-cta-title"
      >
        <h2
          id="providers-cta-title"
          className="text-2xl sm:text-3xl font-bold text-white mb-3"
        >
          {p.ctaTitle}
        </h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          {p.ctaSubtitle}
        </p>
        <Link
          to="/register"
          className="gradient-btn text-white text-sm font-semibold px-7 py-3 rounded-xl no-underline hover:brightness-110 transition-all duration-200 inline-block"
        >
          {p.ctaRegister}
        </Link>
      </section>
    </div>
  );
}
