import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import useSEO from "../hooks/useSEO";

// ---------------------------------------------------------------------------
// Accordion item for audit findings
// ---------------------------------------------------------------------------
interface AccordionItemProps {
  label: string;
  severity: "p0" | "p1" | "p2";
  items: Array<{ title: string; sha: string }>;
  fixedLabel: string;
  defaultOpen?: boolean;
}

function AccordionItem({
  label,
  severity,
  items,
  fixedLabel,
  defaultOpen = false,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `audit-panel-${severity}`;

  const colorMap = {
    p0: "text-red-400 bg-red-400/10 border-red-400/20",
    p1: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    p2: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer bg-transparent border-none"
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colorMap[severity]}`}
          >
            {label}
          </span>
          <span className="text-gray-400 text-sm">{items.length} findings</span>
        </div>
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
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[1200px]" : "max-h-0"}`}
      >
        <ul className="px-5 pb-4 space-y-3" aria-label={label}>
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-4 py-2.5 border-t border-white/5 first:border-t-0"
            >
              <span className="text-gray-300 text-sm leading-snug flex-1">
                {item.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://github.com/Wintyx57/x402-backend/commit/${item.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-[#FF9900]/70 hover:text-[#FF9900] transition-colors no-underline"
                  aria-label={`Commit ${item.sha}`}
                >
                  {item.sha}
                </a>
                <span className="text-[10px] font-semibold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full">
                  {fixedLabel}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Protection card
// ---------------------------------------------------------------------------
function ProtectionCard({
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

// ---------------------------------------------------------------------------
// SVG icons — inline, no external dependency
// ---------------------------------------------------------------------------
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
function LockIcon() {
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
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}
function KeyIcon() {
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
        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
      />
    </svg>
  );
}
function ClockIcon() {
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
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function DatabaseIcon() {
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
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125S3.75 10.903 3.75 8.625"
      />
    </svg>
  );
}
function CodeIcon() {
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
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      />
    </svg>
  );
}
function BoltIcon() {
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
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}
function CpuIcon() {
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
        d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"
      />
    </svg>
  );
}
function RefreshIcon() {
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
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-[#34D399]"
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
function ExternalLinkIcon() {
  return (
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
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Security() {
  const { t } = useTranslation();
  const s = t.security;

  useSEO({
    title: "Security",
    description:
      "x402 Bazaar security posture: April 2026 audit, 29 critical fixes, AES-256-GCM wallet encryption, replay protection, SSRF defense, and on-chain verified smart contracts.",
    keywords:
      "x402 bazaar security, API marketplace security audit, USDC payment security, smart contract security, AES-256-GCM encryption, replay attack protection",
  });

  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();
  const ref5 = useReveal();
  const ref6 = useReveal();

  // JSON-LD: Organization with security contact
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "x402 Bazaar",
      url: "https://x402bazaar.org",
      securityContact: {
        "@type": "ContactPoint",
        contactType: "security",
        email: "security@x402bazaar.org",
      },
    };
    let script = document.getElementById(
      "security-jsonld",
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "security-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
    return () => {
      document.getElementById("security-jsonld")?.remove();
    };
  }, []);

  const protections = [
    { title: s.prot1Title, desc: s.prot1Desc, icon: <ShieldIcon /> },
    { title: s.prot2Title, desc: s.prot2Desc, icon: <RefreshIcon /> },
    { title: s.prot3Title, desc: s.prot3Desc, icon: <KeyIcon /> },
    { title: s.prot4Title, desc: s.prot4Desc, icon: <ClockIcon /> },
    { title: s.prot5Title, desc: s.prot5Desc, icon: <DatabaseIcon /> },
    { title: s.prot6Title, desc: s.prot6Desc, icon: <CodeIcon /> },
    { title: s.prot7Title, desc: s.prot7Desc, icon: <BoltIcon /> },
    { title: s.prot8Title, desc: s.prot8Desc, icon: <CpuIcon /> },
    { title: s.prot9Title, desc: s.prot9Desc, icon: <LockIcon /> },
  ];

  const onChainItems = [
    {
      name: s.onChain1Name,
      desc: s.onChain1Desc,
      chain: s.onChain1Chain,
      link: s.onChain1Link,
    },
    {
      name: s.onChain2Name,
      desc: s.onChain2Desc,
      chain: s.onChain2Chain,
      link: s.onChain2Link,
    },
    {
      name: s.onChain3Name,
      desc: s.onChain3Desc,
      chain: s.onChain3Chain,
      link: s.onChain3Link,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* ------------------------------------------------------------------ */}
      {/* Hero */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={ref1}
        className="reveal text-center mb-16"
        aria-labelledby="security-title"
      >
        <span className="inline-block text-xs font-bold text-[#FF9900] bg-[#FF9900]/10 border border-[#FF9900]/20 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
          {s.badge}
        </span>
        <h1
          id="security-title"
          className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4"
        >
          {s.title}
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
          {s.subtitle}
        </p>

        {/* Trust badge stack */}
        <div
          className="flex flex-wrap justify-center gap-3"
          aria-label="Trust badges"
        >
          {[
            {
              label: s.trustAudit,
              color: "text-[#FF9900] bg-[#FF9900]/10 border-[#FF9900]/20",
            },
            {
              label: s.trustLicense,
              color: "text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/20",
            },
            {
              label: s.trustContracts,
              color: "text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/20",
            },
            {
              label: s.trustFixesCount,
              color: "text-[#34D399] bg-[#34D399]/10 border-[#34D399]/20",
            },
          ].map(({ label, color }) => (
            <span
              key={label}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${color}`}
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Protections grid */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={ref2}
        className="reveal mb-16"
        aria-labelledby="protections-title"
      >
        <div className="text-center mb-8">
          <h2
            id="protections-title"
            className="text-2xl font-bold text-white mb-2"
          >
            {s.protectionsTitle}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            {s.protectionsSubtitle}
          </p>
        </div>
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label={s.protectionsTitle}
        >
          {protections.map((p) => (
            <div key={p.title} role="listitem">
              <ProtectionCard
                title={p.title}
                description={p.desc}
                icon={p.icon}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* On-chain verification */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={ref3}
        className="reveal mb-16"
        aria-labelledby="onchain-title"
      >
        <div className="text-center mb-8">
          <h2 id="onchain-title" className="text-2xl font-bold text-white mb-2">
            {s.onChainTitle}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            {s.onChainSubtitle}
          </p>
        </div>
        <div className="space-y-4">
          {onChainItems.map((item) => (
            <div
              key={item.name}
              className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/20 flex items-center gap-1">
                    <CheckIcon />
                    {s.onChainVerified}
                  </span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/8">
                  {item.chain}
                </span>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#FF9900] hover:text-[#FFB340] transition-colors no-underline font-medium"
                  aria-label={`View ${item.name} on blockchain explorer`}
                >
                  Explorer
                  <ExternalLinkIcon />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Audit findings accordion */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={ref4}
        className="reveal mb-16"
        aria-labelledby="audit-title"
      >
        <div className="text-center mb-8">
          <h2 id="audit-title" className="text-2xl font-bold text-white mb-2">
            {s.auditTitle}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            {s.auditSubtitle}
          </p>
        </div>
        <div className="space-y-3">
          <AccordionItem
            label={s.auditP0Label}
            severity="p0"
            items={s.auditP0Items}
            fixedLabel={s.auditFixed}
            defaultOpen
          />
          <AccordionItem
            label={s.auditP1Label}
            severity="p1"
            items={s.auditP1Items}
            fixedLabel={s.auditFixed}
          />
          <AccordionItem
            label={s.auditP2Label}
            severity="p2"
            items={s.auditP2Items}
            fixedLabel={s.auditFixed}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Responsible disclosure */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={ref5}
        className="reveal mb-16"
        aria-labelledby="disclosure-title"
      >
        <div className="gradient-cta rounded-2xl p-8">
          <div className="max-w-3xl mx-auto">
            <h2
              id="disclosure-title"
              className="text-2xl font-bold text-white mb-2"
            >
              {s.disclosureTitle}
            </h2>
            <p className="text-gray-400 text-sm mb-6">{s.disclosureSubtitle}</p>

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  {s.disclosureEmailLabel}
                </h3>
                <a
                  href={`mailto:${s.disclosureEmail}`}
                  className="text-[#FF9900] font-mono text-sm hover:text-[#FFB340] transition-colors no-underline"
                >
                  {s.disclosureEmail}
                </a>
                <p className="text-gray-500 text-xs mt-2">
                  {s.disclosureResponse}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {s.disclosureCritical}
                </p>
              </div>

              {/* Scope */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  {s.disclosureScope}
                </h3>
                <ul className="space-y-1" aria-label={s.disclosureScope}>
                  {s.disclosureScopeItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-gray-300"
                    >
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Out of scope */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                {s.disclosureOutOfScope}
              </h3>
              <ul
                className="flex flex-wrap gap-2"
                aria-label={s.disclosureOutOfScope}
              >
                {s.disclosureOutItems.map((item) => (
                  <li
                    key={item}
                    className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/8"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Coming soon */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={ref6}
        className="reveal mb-16"
        aria-labelledby="coming-soon-title"
      >
        <h2
          id="coming-soon-title"
          className="text-xl font-bold text-white mb-5"
        >
          {s.comingSoonTitle}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: s.bugBountyTitle, desc: s.bugBountyDesc },
            { title: s.auditTrailTitle, desc: s.auditTrailDesc },
            { title: s.soc2Title, desc: s.soc2Desc },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="glass-card rounded-xl p-5 border-dashed opacity-70"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"
                  aria-hidden="true"
                />
                <h3 className="text-white font-semibold text-sm">{title}</h3>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA footer */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="text-center py-12 border-t border-white/8"
        aria-labelledby="security-cta-title"
      >
        <h2
          id="security-cta-title"
          className="text-2xl font-bold text-white mb-3"
        >
          {s.ctaTitle}
        </h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          {s.ctaSubtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/quickstart"
            className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl no-underline hover:brightness-110 transition-all duration-200"
          >
            {s.ctaQuickstart}
          </Link>
          <a
            href={`mailto:${s.disclosureEmail}`}
            className="glass text-white text-sm font-medium px-5 py-2.5 rounded-xl no-underline hover:bg-white/[0.08] transition-all duration-200"
          >
            {s.ctaContact}
          </a>
        </div>
      </section>
    </div>
  );
}
