import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import useSEO from "../hooks/useSEO";

// ---- Types ----
interface Step {
  label: string;
  desc: string;
  price: string;
  endpoint: string;
  color: string;
}

interface Workflow {
  id: string;
  title: string;
  desc: string;
  cost: string;
  steps: Step[];
  code: string;
}

// ---- CopyButton ----
function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  const uc = t.useCases;

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                 bg-white/5 border border-white/10 text-gray-400
                 hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <svg
            className="w-3.5 h-3.5 text-[#34D399]"
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
          <span className="text-[#34D399]">{uc.copiedBtn}</span>
        </>
      ) : (
        <>
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
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          {uc.copyBtn}
        </>
      )}
    </button>
  );
}

// ---- Step pipeline ----
function StepPipeline({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center shrink-0">
          <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0"
              style={{
                borderColor: step.color,
                color: step.color,
                background: `${step.color}18`,
              }}
            >
              {i + 1}
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-white">
                {step.label}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                {step.desc}
              </div>
              <code className="text-[9px] text-[#FF9900]/70 font-mono block mt-0.5 truncate max-w-[90px]">
                {step.endpoint}
              </code>
              <span className="text-[10px] font-mono text-[#34D399] mt-0.5 block">
                {step.price}
              </span>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex items-center mx-1 mt-[-24px]">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
  );
}

// ---- Workflow card ----
function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const { t } = useTranslation();
  const uc = t.useCases;
  const [activeTab, setActiveTab] = useState<"steps" | "code">("steps");

  return (
    <article className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-white">{workflow.title}</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              {workflow.desc}
            </p>
          </div>
          <div className="shrink-0">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                            text-xs font-semibold bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399]"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {workflow.cost} {uc.perRun}
            </span>
          </div>
        </div>

        <div className="flex gap-1 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab("steps")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
              activeTab === "steps"
                ? "bg-[#FF9900]/15 text-[#FF9900]"
                : "bg-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Pipeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
              activeTab === "code"
                ? "bg-[#FF9900]/15 text-[#FF9900]"
                : "bg-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {uc.sdkLabel}
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "steps" ? (
          <StepPipeline steps={workflow.steps} />
        ) : (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-xs text-gray-500 ml-2 font-mono">
                  agent.py
                </span>
              </div>
              <CopyCodeButton code={workflow.code} />
            </div>
            <pre
              className="bg-[#0d1117] rounded-xl p-4 text-xs font-mono text-gray-300 overflow-x-auto
                            border border-white/5 leading-relaxed"
            >
              <code>{workflow.code}</code>
            </pre>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 flex items-center gap-3 flex-wrap">
        <Link
          to="/playground"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2
                     bg-[#FF9900] text-white rounded-lg no-underline
                     hover:bg-[#FF9900]/90 transition-colors"
        >
          {uc.tryBtn}
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
              strokeWidth={2.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
        <Link
          to="/developers"
          className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2
                     bg-white/5 border border-white/10 text-gray-300 rounded-lg no-underline
                     hover:text-white hover:border-white/20 transition-all"
        >
          {uc.viewDocs}
        </Link>
      </div>
    </article>
  );
}

// ---- Main page ----
export default function UseCases() {
  const { t } = useTranslation();
  const uc = t.useCases;

  const heroRef = useReveal();
  const w1Ref = useReveal();
  const w2Ref = useReveal();
  const w3Ref = useReveal();
  const ctaRef = useReveal();

  useSEO({
    title: "Use Cases — x402 Bazaar | AI Agent Workflows",
    description:
      "Curated agent workflows showing how AI agents chain multiple APIs to complete real tasks using x402 micropayments.",
    keywords:
      "AI agent workflows, x402 use cases, autonomous agent examples, micropayments, API chaining",
  });

  const workflows: Workflow[] = [
    {
      id: "research",
      title: uc.workflow1Title,
      desc: uc.workflow1Desc,
      cost: uc.workflow1Cost,
      steps: [
        {
          label: uc.workflow1Step1Label,
          desc: uc.workflow1Step1Desc,
          price: "$0.005",
          endpoint: "/api/search",
          color: "#60A5FA",
        },
        {
          label: uc.workflow1Step2Label,
          desc: uc.workflow1Step2Desc,
          price: "$0.005",
          endpoint: "/api/scrape",
          color: "#A78BFA",
        },
        {
          label: uc.workflow1Step3Label,
          desc: uc.workflow1Step3Desc,
          price: "$0.005",
          endpoint: "/api/summarize",
          color: "#34D399",
        },
      ],
      code: `from x402_bazaar import BazaarClient

client = BazaarClient(
    private_key="YOUR_PRIVATE_KEY",
    base_url="https://x402-api.onrender.com"
)

async def research_agent(topic: str) -> dict:
    """
    Research agent: search → scrape → summarize
    Total cost: $0.015 per run
    """
    # Step 1 — Search ($0.005)
    search_results = await client.call(
        "/api/search",
        params={"q": topic, "limit": 5}
    )

    # Step 2 — Scrape top result ($0.005)
    top_url = search_results["results"][0]["url"]
    content = await client.call(
        "/api/scrape",
        params={"url": top_url}
    )

    # Step 3 — Summarize ($0.005)
    summary = await client.call(
        "/api/summarize",
        params={"text": content["text"], "max_length": 200}
    )

    return {
        "topic": topic,
        "summary": summary["result"],
        "sources": [r["url"] for r in search_results["results"]],
        "total_cost": "$0.015"
    }

# Run
import asyncio
result = asyncio.run(research_agent("quantum computing breakthroughs"))
print(result["summary"])`,
    },
    {
      id: "image",
      title: uc.workflow2Title,
      desc: uc.workflow2Desc,
      cost: uc.workflow2Cost,
      steps: [
        {
          label: uc.workflow2Step1Label,
          desc: uc.workflow2Step1Desc,
          price: "$0.02",
          endpoint: "/api/image",
          color: "#F59E0B",
        },
      ],
      code: `from x402_bazaar import BazaarClient
import base64, pathlib

client = BazaarClient(
    private_key="YOUR_PRIVATE_KEY",
    base_url="https://x402-api.onrender.com"
)

async def image_agent(prompt: str, output_path: str = "output.png") -> dict:
    """
    Image generation agent: text → image (Gemini-powered)
    Total cost: $0.02 per image
    """
    # Generate image ($0.02)
    result = await client.call(
        "/api/image",
        method="POST",
        json={
            "prompt": prompt,
            "width": 1024,
            "height": 1024,
            "quality": "high"
        }
    )

    # Save to disk
    image_bytes = base64.b64decode(result["image_base64"])
    pathlib.Path(output_path).write_bytes(image_bytes)

    return {
        "prompt": prompt,
        "output": output_path,
        "width": result["width"],
        "height": result["height"],
        "model": result["model"],  # "gemini-imagen-3"
        "total_cost": "$0.02"
    }

# Run
import asyncio
info = asyncio.run(
    image_agent("A futuristic city skyline at sunset, cyberpunk style")
)
print(f"Image saved to {info['output']} — model: {info['model']}")`,
    },
    {
      id: "enrichment",
      title: uc.workflow3Title,
      desc: uc.workflow3Desc,
      cost: uc.workflow3Cost,
      steps: [
        {
          label: uc.workflow3Step1Label,
          desc: uc.workflow3Step1Desc,
          price: "$0.01",
          endpoint: "/api/news",
          color: "#60A5FA",
        },
        {
          label: uc.workflow3Step2Label,
          desc: uc.workflow3Step2Desc,
          price: "$0.005",
          endpoint: "/api/sentiment",
          color: "#F59E0B",
        },
        {
          label: uc.workflow3Step3Label,
          desc: uc.workflow3Step3Desc,
          price: "$0.01",
          endpoint: "/api/stocks",
          color: "#34D399",
        },
      ],
      code: `from x402_bazaar import BazaarClient
import asyncio

client = BazaarClient(
    private_key="YOUR_PRIVATE_KEY",
    base_url="https://x402-api.onrender.com"
)

async def enrichment_agent(company: str, ticker: str) -> dict:
    """
    Data enrichment: news + sentiment + stocks in parallel
    Total cost: $0.025 per run
    """
    # Run news + stocks in parallel for speed
    news_task = client.call(
        "/api/news",
        params={"q": company, "limit": 10}
    )
    stocks_task = client.call(
        "/api/stocks",
        params={"ticker": ticker}
    )

    news, stocks = await asyncio.gather(news_task, stocks_task)

    # Analyze sentiment on news headlines ($0.005)
    headlines = " ".join([a["title"] for a in news["articles"][:5]])
    sentiment = await client.call(
        "/api/sentiment",
        params={"text": headlines}
    )

    return {
        "company": company,
        "ticker": ticker,
        "sentiment_score": sentiment["score"],      # -1.0 to +1.0
        "sentiment_label": sentiment["label"],       # positive/negative/neutral
        "stock_price": stocks["price"],
        "stock_change_pct": stocks["change_pct"],
        "top_headline": news["articles"][0]["title"],
        "total_cost": "$0.025"
    }

# Run
result = asyncio.run(enrichment_agent("Apple Inc", "AAPL"))
print(f"Sentiment: {result['sentiment_label']} ({result['sentiment_score']:.2f})")
print(f"Stock: ${result["stock_price"]} ({result['stock_change_pct']:+.2f}%)")`,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="reveal-section max-w-5xl mx-auto px-4 pt-16 pb-12 text-center"
      >
        <p className="text-[#FF9900] text-xs font-semibold uppercase tracking-widest mb-3">
          {uc.badge}
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
          {uc.title}
        </h1>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
          {uc.subtitle}
        </p>

        {/* Quick stats */}
        <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
          {[
            { value: "$0.005", label: "cheapest call" },
            { value: "112+", label: "APIs available" },
            { value: "3", label: "blockchains" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-[#FF9900]">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WORKFLOWS ===== */}
      <div className="max-w-5xl mx-auto px-4 space-y-8 pb-16">
        <section ref={w1Ref} className="reveal-section">
          <WorkflowCard workflow={workflows[0]} />
        </section>

        <section ref={w2Ref} className="reveal-section">
          <WorkflowCard workflow={workflows[1]} />
        </section>

        <section ref={w3Ref} className="reveal-section">
          <WorkflowCard workflow={workflows[2]} />
        </section>
      </div>

      {/* ===== CTA SECTION ===== */}
      <section
        ref={ctaRef}
        className="reveal-section max-w-3xl mx-auto px-4 pb-24 text-center"
      >
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">{uc.ctaTitle}</h2>
          <p className="text-gray-400 text-sm mb-6">{uc.ctaDesc}</p>

          <div
            className="flex items-center justify-between gap-3 bg-[#0d1117] rounded-xl px-4 py-3
                          border border-white/5 mb-6 max-w-md mx-auto"
          >
            <code className="text-sm font-mono text-[#34D399] flex-1 text-left">
              {uc.ctaInstall}
            </code>
            <CopyCodeButton code={uc.ctaInstall} />
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/quickstart"
              className="inline-flex items-center gap-1.5 gradient-btn text-white text-sm font-semibold
                         px-5 py-2.5 rounded-lg no-underline transition-all duration-200 hover:brightness-110"
            >
              {uc.ctaBtn}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2.5
                         bg-white/5 border border-white/10 text-gray-300 rounded-lg no-underline
                         hover:text-white hover:border-white/20 transition-all"
            >
              Browse APIs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
