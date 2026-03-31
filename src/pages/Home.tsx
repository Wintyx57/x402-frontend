import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import { useTranslation } from "../i18n/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import useSEO from "../hooks/useSEO";
import { useServices } from "../hooks/useServices";
import { usePublicStats } from "../hooks/usePublicStats";
import ServiceCard from "../components/ServiceCard";
import CategoryIcon from "../components/CategoryIcon";
import GitHubIcon from "../components/icons/GitHubIcon";
import {
  BaseLogo,
  SkaleLogo,
  PolygonLogo,
} from "../components/icons/ChainLogos";
import { VALID_CATEGORIES } from "../data/categories";
import SplitHero from "../components/SplitHero";

// ---- CountUp ----
function CountUp({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const lastEnd = useRef(0);
  const isVisible = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let activeTimer: ReturnType<typeof setInterval> | null = null;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const startAnimation = () => {
      if (activeTimer) clearInterval(activeTimer);
      lastEnd.current = end;
      const increment = end / (duration / 16);
      let current = 0;
      if (prefersReducedMotion) {
        setCount(end);
        return;
      }
      activeTimer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          if (activeTimer) clearInterval(activeTimer);
          activeTimer = null;
        } else {
          setCount(Math.floor(current));
        }
      }, 16);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting && end > 0 && end !== lastEnd.current) {
          startAnimation();
        }
      },
      { threshold: 0.3 },
    );

    // If already visible when end changes (stats loaded after mount)
    if (isVisible.current && end > 0 && end !== lastEnd.current) {
      startAnimation();
    }

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (activeTimer) clearInterval(activeTimer);
    };
  }, [end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

// ---- Integration badge ----

function IntegrationBadge({
  label,
  icon,
  href,
}: {
  label: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <div className="flex flex-col items-center gap-2 group">
      <div
        className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                      group-hover:border-[#FF9900]/50 group-hover:bg-[#FF9900]/10 group-hover:shadow-[0_0_16px_rgba(255,153,0,0.12)] transition-all duration-300"
      >
        {icon}
      </div>
      <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
        {label}
      </span>
    </div>
  );
  if (href) {
    if (href.startsWith("http")) {
      return (
        <a
          href={href}
          className="no-underline"
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
        >
          {inner}
        </a>
      );
    }
    return (
      <Link to={href} className="no-underline" aria-label={label}>
        {inner}
      </Link>
    );
  }
  return inner;
}

// ---- SVG icons ----
const IconZero = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);
const IconAgent = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);
const IconChain = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);
const IconOpen = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);
const IconExternal = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

// ---- Main component ----
export default function Home() {
  const { data: stats } = usePublicStats();
  const {
    data: servicesData,
    isLoading: loading,
    error: servicesError,
  } = useServices();
  const services = Array.isArray(servicesData) ? servicesData : [];
  const [avgLatency, setAvgLatency] = useState<number | null>(null);
  const { t } = useTranslation();

  // Reveal refs
  const howRef = useReveal();
  const valueProRef = useReveal();
  const integrationsRef = useReveal();
  const socialRef = useReveal();
  const catRef = useReveal();
  const freeRef = useReveal();
  const paidRef = useReveal();
  const statsRef = useReveal();
  const ctaRef = useReveal();

  useSEO({
    title: "x402 Bazaar — The API Marketplace for AI Agents",
    description:
      "Pay-per-call APIs with USDC. No API keys. No subscriptions. Built on HTTP 402 protocol. 100+ services on Base & SKALE.",
    keywords:
      "x402 protocol, AI agent payments, micropayments API, USDC marketplace, HTTP 402, Base blockchain, MCP server",
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    fetch(`${API_URL}/api/status`, { signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.endpoints?.length) {
          const latencies = data.endpoints
            .filter((e: { latency: number }) => e.latency > 0)
            .map((e: { latency: number }) => e.latency);
          if (latencies.length)
            setAvgLatency(
              Math.round(
                latencies.reduce((a: number, b: number) => a + b, 0) /
                  latencies.length,
              ),
            );
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Category data
  const categoryCounts: Record<string, number> = {};
  services.forEach((s) => {
    (s.tags || []).forEach((tag: string) => {
      if ((VALID_CATEGORIES as string[]).includes(tag))
        categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
    });
  });
  const categories =
    services.length > 0
      ? VALID_CATEGORIES.filter((cat) => categoryCounts[cat] > 0).sort(
          (a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0),
        )
      : VALID_CATEGORIES;

  const freeServices = services
    .filter((s) => Number(s.price_usdc) === 0)
    .slice(0, 4);
  const paidServices = services
    .filter((s) => Number(s.price_usdc) > 0)
    .sort((a, b) => Number(b.price_usdc) - Number(a.price_usdc))
    .slice(0, 4);
  const nativeCount = services.filter((s) =>
    s.url?.startsWith("https://x402-api.onrender.com"),
  ).length;

  // Integration platform data
  const integrations = [
    {
      label: "Claude / MCP",
      href: "/mcp",
      icon: (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
      ),
    },
    {
      label: "ChatGPT",
      href: "/integrate",
      icon: (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
      ),
    },
    {
      label: "CLI npm",
      href: "/developers",
      icon: (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: "LangChain",
      href: "/integrate",
      icon: (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
    },
    {
      label: "Telegram",
      href: "/integrate",
      icon: (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      label: "Auto-GPT",
      href: "/integrate",
      icon: (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      label: "Bazaar Discovery",
      href: "/developers",
      icon: (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "n8n",
      href: "https://www.npmjs.com/package/@wintyx/n8n-nodes-x402-bazaar",
      icon: (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="6" cy="12" r="2" strokeWidth={2} />
          <circle cx="18" cy="6" r="2" strokeWidth={2} />
          <circle cx="18" cy="18" r="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeWidth={2}
            d="M8 12h4m2-3l-2 3 2 3"
          />
        </svg>
      ),
    },
    {
      label: "TS SDK",
      href: "https://www.npmjs.com/package/@wintyx/x402-sdk",
      icon: (
        <svg
          className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 21h8M12 17v4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h2.5a1.5 1.5 0 010 3H8m0-6v6m8-6v6m-2-6h4"
          />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* ===== HERO ===== */}
      <SplitHero />

      {/* Error banner */}
      {servicesError && (
        <div className="max-w-3xl mx-auto px-4 mb-6">
          <div
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center text-sm text-red-400"
            role="alert"
          >
            {t.home.errorLoadServices}
          </div>
        </div>
      )}

      {/* ===== HOW IT WORKS ===== */}
      <section
        ref={howRef}
        className="reveal-section max-w-5xl mx-auto px-4 mb-24"
      >
        <div className="text-center mb-12">
          <p className="text-[#FF9900] text-xs font-semibold uppercase tracking-widest mb-3">
            {t.home.howLabel}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {t.home.howItWorks}
          </h2>
          <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
            Three steps to autonomous API monetization — no API keys, no billing
            setup.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-0">
          {[
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              ),
              label: t.home.howStep1Icon,
              title: t.home.step1Title,
              desc: t.home.step1Desc,
              color: "text-[#FF9900]",
              bg: "bg-[#FF9900]/8 border-[#FF9900]/25",
              glow: "hover:shadow-[0_0_28px_rgba(255,153,0,0.12)]",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
              label: t.home.howStep2Icon,
              title: t.home.step2Title,
              desc: t.home.step2Desc,
              color: "text-[#60A5FA]",
              bg: "bg-blue-500/8 border-blue-500/25",
              glow: "hover:shadow-[0_0_28px_rgba(96,165,250,0.12)]",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              label: t.home.howStep3Icon,
              title: t.home.step3Title,
              desc: t.home.step3Desc,
              color: "text-[#34D399]",
              bg: "bg-emerald-500/8 border-emerald-500/25",
              glow: "hover:shadow-[0_0_28px_rgba(52,211,153,0.12)]",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row items-center gap-4 md:gap-0 flex-1"
            >
              <div
                className={`glass-card rounded-xl p-7 w-full max-w-xs mx-auto text-center animate-fade-in-up
                           hover:border-[#FF9900]/30 hover:bg-white/[0.06] transition-all duration-300 ${step.glow} relative`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Step number — top right */}
                <div
                  className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center
                                text-xs font-bold text-[#FF9900] bg-[#FF9900]/10 border border-[#FF9900]/20"
                >
                  {i + 1}
                </div>
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5
                                border-2 ${step.color} ${step.bg}`}
                >
                  {step.icon}
                </div>
                <div
                  className={`text-xs font-semibold uppercase tracking-wider mb-2 ${step.color}`}
                >
                  {step.label}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {step.desc}
                </p>
              </div>
              {i < 2 && (
                <div
                  className="hidden md:flex items-center justify-center w-12 shrink-0"
                  aria-hidden="true"
                >
                  <svg
                    className="w-6 h-6 text-[#FF9900]/25"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Code snippet */}
        <div
          className="mt-10 max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <pre
            className="code-block rounded-xl text-xs sm:text-sm overflow-x-auto"
            aria-label={t.home.codeSnippetLabel}
          >
            <code>
              <span className="comment"># 1. Discover the API</span>
              {"\n"}
              <span className="keyword">curl</span> {API_URL}/api/search?q=AI
              {"\n\n"}
              <span className="comment">
                # 2. Agent receives HTTP 402 → auto-pays 0.005 USDC
              </span>
              {"\n"}
              <span className="comment">
                # 3. Retry with payment proof → instant results
              </span>
              {"\n"}
              <span className="keyword">curl</span> -H{" "}
              <span className="string">"X-Payment: {"<tx_hash>"}"</span>{" "}
              {API_URL}/api/search?q=AI{"\n"}
              <span className="comment">{"# → { results: [...] }"}</span>
            </code>
          </pre>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section
        ref={valueProRef}
        className="reveal-section max-w-5xl mx-auto px-4 mb-24"
      >
        <div className="text-center mb-12">
          <p className="text-[#FF9900] text-xs font-semibold uppercase tracking-widest mb-3">
            {t.home.whyLabel}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {t.home.valueProTitle}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <IconZero />,
              title: t.home.valuePro1Title,
              desc: t.home.valuePro1Desc,
              accent: "text-[#FF9900]",
              bg: "bg-[#FF9900]/5 border-[#FF9900]/20",
            },
            {
              icon: <IconAgent />,
              title: t.home.valuePro2Title,
              desc: t.home.valuePro2Desc,
              accent: "text-[#60A5FA]",
              bg: "bg-blue-500/5 border-blue-500/20",
            },
            {
              icon: <IconChain />,
              title: t.home.valuePro3Title,
              desc: t.home.valuePro3Desc,
              accent: "text-[#34D399]",
              bg: "bg-emerald-500/5 border-emerald-500/20",
            },
            {
              icon: <IconOpen />,
              title: t.home.valuePro4Title,
              desc: t.home.valuePro4Desc,
              accent: "text-violet-400",
              bg: "bg-violet-500/5 border-violet-500/20",
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="glass-card rounded-xl p-6 text-center animate-fade-in-up
                         hover:shadow-[0_0_28px_rgba(255,153,0,0.10)] hover:border-[#FF9900]/30 hover:bg-white/[0.06] transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border ${card.accent} ${card.bg}`}
              >
                {card.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">
                {card.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== INTEGRATIONS ===== */}
      <section
        ref={integrationsRef}
        className="reveal-section max-w-4xl mx-auto px-4 mb-24"
      >
        <div className="text-center mb-10">
          <p className="text-[#FF9900] text-xs font-semibold uppercase tracking-widest mb-3">
            {t.home.integrationsLabel}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {t.home.integrationsTitle}
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {t.home.integrationsSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {integrations.map((item, i) => (
            <div
              key={item.label}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <IntegrationBadge
                label={item.label}
                icon={item.icon}
                href={item.href}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ===== SOCIAL PROOF / TRACTION ===== */}
      <section
        ref={socialRef}
        className="reveal-section max-w-5xl mx-auto px-4 mb-24"
      >
        <div className="glass-card rounded-2xl p-8 sm:p-10 border border-white/10">
          <div className="text-center mb-10">
            <p className="text-[#FF9900] text-xs font-semibold uppercase tracking-widest mb-3">
              {t.home.tractionLabel}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {t.home.tractionTitle}
            </h2>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 mb-10">
            <div className="text-center animate-fade-in-up">
              <div className="text-4xl font-bold gradient-text mb-2">
                <CountUp end={stats?.totalPayments || 170} suffix="+" />
              </div>
              <p className="text-gray-400 text-sm">{t.home.tractionPayments}</p>
            </div>
            <div
              className="text-center animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="text-4xl font-bold text-[#34D399] mb-2">
                <CountUp end={stats?.externalProviders || 3} />
              </div>
              <p className="text-gray-400 text-sm">
                {t.home.tractionProviders}
              </p>
            </div>
            <div
              className="text-center animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="text-4xl font-bold text-[#60A5FA] mb-2">
                <CountUp
                  end={stats?.usdcVolume || 19}
                  prefix="$"
                  suffix=" USDC"
                />
              </div>
              <p className="text-gray-400 text-sm">{t.home.tractionVolume}</p>
            </div>
          </div>

          {/* Featured providers — social proof cards */}
          <div className="mb-10">
            <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-5">
              Featured Providers
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  name: "Interzoid",
                  category: "Data / Intelligence",
                  desc: "Company name matching and entity resolution at scale.",
                  url: "https://api.interzoid.com",
                  status: "mainnet_verified",
                  statusLabel: "Verified",
                  statusColor:
                    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                },
                {
                  name: "AgentsHere",
                  category: "AI Verification",
                  desc: "Agent identity verification and attestation service.",
                  url: null,
                  status: "mainnet_verified",
                  statusLabel: "Verified",
                  statusColor:
                    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                },
                {
                  name: "Fia Signals",
                  category: "Finance / Trading",
                  desc: "Real-time trading signals and market intelligence data.",
                  url: "https://x402.fiasignals.com",
                  status: "reachable",
                  statusLabel: "Auto-tested",
                  statusColor:
                    "text-blue-400 bg-blue-500/10 border-blue-500/20",
                },
              ].map((provider, i) => (
                <div
                  key={provider.name}
                  className="glass rounded-xl p-4 border border-white/8 hover:border-[#FF9900]/30 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(255,153,0,0.08)] transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF9900]/15 to-[#FF9900]/5
                                    border border-[#FF9900]/20 flex items-center justify-center shrink-0"
                    >
                      <span className="text-sm font-bold text-[#FF9900]">
                        {provider.name.charAt(0)}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${provider.statusColor}`}
                    >
                      {provider.statusLabel}
                    </span>
                  </div>
                  <p className="text-white text-sm font-semibold mb-0.5">
                    {provider.name}
                  </p>
                  <p className="text-[10px] text-[#FF9900]/70 font-medium mb-2">
                    {provider.category}
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed mb-3">
                    {provider.desc}
                  </p>
                  {provider.url && (
                    <a
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[#FF9900] hover:text-[#FEBD69] no-underline transition-colors font-medium"
                    >
                      View API <IconExternal />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial quote */}
          <div
            className="max-w-lg mx-auto animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <blockquote className="glass rounded-xl p-5 border border-white/8 relative">
              <div
                className="absolute -top-3 left-5 text-[#FF9900]/40 text-4xl font-serif leading-none select-none"
                aria-hidden="true"
              >
                "
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed mb-3 pt-1">
                "{t.home.testimonialQuote}"
              </p>
              <footer className="flex items-center justify-start gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF9900]/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <cite className="text-xs text-gray-400 not-italic">
                  {t.home.testimonialAuthor}
                </cite>
                <span className="ml-auto text-xs text-[#FF9900]/60 font-medium">
                  Interzoid · Data Provider
                </span>
              </footer>
            </blockquote>
          </div>

          {/* ERC-8004 badge */}
          <div
            className="flex justify-center mt-8 animate-fade-in-up"
            style={{ animationDelay: "450ms" }}
          >
            <a
              href="https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline inline-flex items-center gap-2.5 bg-white/5 border border-violet-500/20
                         rounded-xl px-5 py-3 hover:border-violet-500/40 hover:bg-white/[0.07]
                         transition-all duration-300 group"
              aria-label={t.home.erc8004Badge}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
                <svg
                  className="w-4 h-4 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                {t.home.erc8004Badge}
              </span>
              <span className="text-gray-500 group-hover:text-violet-400 transition-colors">
                <IconExternal />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section
        ref={catRef}
        className="reveal-section max-w-7xl mx-auto px-4 mb-20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {t.home.browseByCategory}
          </h2>
          <Link
            to="/services"
            className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69]"
          >
            {t.home.viewAll} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <Link
              key={cat}
              to={`/services?cat=${cat}`}
              className="no-underline glass-card rounded-lg p-3 text-center
                         transition-all duration-200 hover:bg-white/[0.12] hover:border-[#FF9900]/35
                         hover:shadow-[0_0_24px_rgba(255,153,0,0.12),0_4px_16px_rgba(0,0,0,0.3)] animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CategoryIcon category={cat} className="w-5 h-5 mx-auto mb-1.5" />
              <div className="text-white text-sm font-medium">
                {t.home.categories[cat]}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {categoryCounts[cat] || 0} APIs
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Loading skeletons while services load */}
      {loading && (
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <div className="h-6 w-40 bg-white/5 rounded-lg mb-6 animate-shimmer" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 h-56 animate-shimmer"
              />
            ))}
          </div>
        </section>
      )}

      {/* ===== FREE APIs ===== */}
      {freeServices.length > 0 && (
        <section
          ref={freeRef}
          className="reveal-section max-w-7xl mx-auto px-4 mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {t.home.freeApisTitle}
            </h2>
            <Link
              to="/services?price=free"
              className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69]"
            >
              {t.home.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeServices.map((s, i) => (
              <div
                key={s.id}
                className="animate-fade-in-up h-full"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== PREMIUM APIs ===== */}
      {paidServices.length > 0 && (
        <section
          ref={paidRef}
          className="reveal-section max-w-7xl mx-auto px-4 mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {t.home.premiumApisTitle}
            </h2>
            <Link
              to="/services?price=paid"
              className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69]"
            >
              {t.home.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paidServices.map((s, i) => (
              <div
                key={s.id}
                className="animate-fade-in-up h-full"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== STATS BAR ===== */}
      {stats && (
        <section
          ref={statsRef}
          className="reveal-section max-w-5xl mx-auto px-4 mb-20"
        >
          <div className="glass-card rounded-xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-white">
                <CountUp end={stats.services || 0} />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {t.home.servicesListed}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-[#FF9900]">
                <CountUp end={nativeCount || 69} />
              </div>
              <div className="text-xs text-gray-400 mt-1">Native APIs</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <BaseLogo className="w-6 h-6 sm:w-8 sm:h-8" />
                <SkaleLogo className="w-6 h-6 sm:w-8 sm:h-8 rounded-md" />
                <PolygonLogo className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-xs text-gray-400 mt-1">Blockchain</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-white">
                <CountUp end={categories.length} />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {t.home.categoriesCount}
              </div>
            </div>
            {avgLatency ? (
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-white">
                  <CountUp end={avgLatency} suffix="ms" />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {t.home.avgTransaction}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-[#34D399]">
                  ~$0.0007 Gas
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {t.home.onSkale}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== FINAL CTA ===== */}
      <section
        ref={ctaRef}
        className="reveal-section max-w-5xl mx-auto px-4 mb-20"
      >
        {/* Main CTA banner */}
        <div className="gradient-cta glow-orange rounded-2xl p-10 sm:p-14 text-center mb-5 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 0%, rgba(255,153,0,0.12) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {t.home.finalCtaTitle}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-xl mx-auto">
              {t.home.finalCtaDesc}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/services"
                className="gradient-btn text-white px-8 py-3 rounded-xl text-sm font-semibold no-underline
                           hover:brightness-110 hover:scale-[1.02] transition-all duration-200 animate-pulse-glow"
              >
                {t.home.exploreCTA.replace(
                  "{count}",
                  String(stats?.services || 100),
                )}
              </Link>
              <Link
                to="/register"
                className="glass text-gray-300 px-8 py-3 rounded-xl text-sm font-medium no-underline
                           hover:border-white/20 hover:text-white transition-all duration-200"
              >
                {t.home.listApiCTA}
              </Link>
            </div>
          </div>
        </div>

        {/* Provider CTA */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="glass-card rounded-xl p-8 text-center flex flex-col justify-between border border-[#FF9900]/10">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t.home.providerTitle}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {t.home.providerDesc}
              </p>
            </div>
            <a
              href="https://github.com/Wintyx57/x402-fast-monetization-template"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline
                         hover:brightness-110 transition-all inline-flex items-center justify-center gap-2"
            >
              <GitHubIcon />
              {t.home.providerBtn}
            </a>
          </div>

          <div className="glass-card rounded-xl p-8 text-center flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t.home.integrateTitle}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {t.home.integrateDesc}
              </p>
            </div>
            <Link
              to="/integrate"
              className="glass text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium no-underline
                         hover:border-[#FF9900]/30 hover:text-white transition-all inline-flex items-center justify-center gap-2"
            >
              {t.home.integrateAgent} →
            </Link>
          </div>
        </div>
      </section>

      {/* Live Agent Teaser */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <Link
          to="/agent"
          className="block glass-card rounded-2xl p-6 sm:p-8 hover:border-emerald-500/20 transition-all no-underline group"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="live-dot-static" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-[0.12em]">
                Live Agent
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FF9900] transition-colors">
                {t.liveAgent?.title || "Live AI Agent"}
              </h3>
              <p className="text-sm text-gray-400">
                {t.liveAgent?.subtitle ||
                  "This autonomous agent calls 3 space APIs and pays real USDC — twice a day, fully automated."}
              </p>
            </div>
            <span className="text-gray-500 group-hover:text-[#FF9900] transition-colors text-xl">
              &rarr;
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}
