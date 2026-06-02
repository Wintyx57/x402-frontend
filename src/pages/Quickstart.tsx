import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Copy,
  Check,
  Play,
  Terminal,
  ChevronRight,
  Wallet,
  BookOpen,
  Blocks,
  ArrowRight,
  Clock,
  Shield,
} from "lucide-react";
import useSEO from "../hooks/useSEO";
import { API_URL } from "../config";
import { track } from "../analytics";

/* ─── Live Try-It ─── */
function LiveTryIt() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const tryApi = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    const start = performance.now();
    try {
      const res = await fetch(
        `${API_URL}/api/translate?text=Hello%20world&to=fr`,
      );
      const data = await res.json();
      setElapsed(Math.round(performance.now() - start));
      setResponse(JSON.stringify(data, null, 2));
    } catch {
      setElapsed(Math.round(performance.now() - start));
      setResponse('{"error": "Network error — try again"}');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="mt-4">
      <button
        onClick={tryApi}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#FF9900] text-black font-semibold rounded-lg px-5 py-2.5 hover:bg-[#FF9900]/90 transition-colors disabled:opacity-50 cursor-pointer text-sm"
      >
        <Play className="w-4 h-4" />
        {loading ? "Calling..." : "Run it live"}
      </button>
      {response && (
        <div className="mt-3 relative">
          {elapsed !== null && (
            <span className="absolute top-2 right-3 text-[10px] text-gray-500 font-mono">
              {elapsed}ms
            </span>
          )}
          <pre className="bg-black/60 border border-green-500/30 rounded-lg p-4 text-green-400 text-xs font-mono overflow-x-auto max-h-48">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ─── Copy Button (inline) ─── */
function InlineCopy({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      const isInstall =
        text.includes("npm install") ||
        text.includes("pip install") ||
        text.includes("npx x402-bazaar");
      track(isInstall ? "cli_install_copied" : "free_call_clicked", {
        text_length: text.length,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };
  return (
    <button
      onClick={copy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all cursor-pointer"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

/* ─── Code Block ─── */
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="relative group">
      <InlineCopy text={code} />
      <pre className="bg-[#0d1117] border border-white/10 rounded-lg p-4 pr-12 text-sm font-mono overflow-x-auto text-gray-300 leading-relaxed">
        <code data-lang={lang}>{code}</code>
      </pre>
    </div>
  );
}

/* ─── Tab selector ─── */
type Tab = "curl" | "javascript" | "python" | "cli";

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: Tab; label: string }[];
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="SDK language"
      className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            active === tab.id
              ? "bg-[#FF9900]/20 text-[#FF9900]"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Step Number ─── */
function StepBadge({ n }: { n: number }) {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF9900]/20 text-[#FF9900] font-bold text-sm shrink-0">
      {n}
    </div>
  );
}

/* ─── Snippets ─── */
const CURL_FREE = `curl "${API_URL}/api/translate?text=Hello%20world&to=fr"`;

const CURL_PAID = `# 1. First call returns 402 with payment details
curl "${API_URL}/api/weather?city=Paris"

# 2. Pay USDC to the address in the 402 response
# 3. Retry with your transaction hash
curl -H "X-Payment-TxHash: 0xYOUR_TX_HASH" \\
     "${API_URL}/api/weather?city=Paris"`;

const JS_SDK = `import { X402Client } from "@wintyx/x402-sdk";

const client = new X402Client({
  privateKey: process.env.WALLET_KEY, // or auto-generated
  chain: "skale", // ultra-low gas fees
});

// Free tier — no payment needed
const free = await client.call("/api/translate", {
  text: "Hello world", to: "fr"
});
console.log(free); // { translated: "Bonjour le monde" }

// Paid API — payment is automatic
const weather = await client.call("/api/weather", { city: "Paris" });
console.log(weather); // { temp: 18.5, ... }`;

const PY_SDK = `from x402_bazaar import X402Client

client = X402Client(
    private_key="YOUR_WALLET_KEY",  # or auto-generated
    chain="skale",  # ultra-low gas fees
)

# Free tier — no payment needed
free = client.call("/api/translate", text="Hello world", to="fr")
print(free)  # {"translated": "Bonjour le monde"}

# Paid API — payment is automatic
weather = client.call("/api/weather", city="Paris")
print(weather)  # {"temp": 18.5, ...}`;

const CLI_SNIPPET = `# Install
npm install -g x402-bazaar

# Try a free API
npx x402-bazaar call /api/translate --param text="Hello world" --param to=fr

# Try a paid API (auto-payment with wallet)
npx x402-bazaar call /api/weather --param city=Paris --key wallet.json`;

const MCP_SNIPPET = `# One command — auto-configures Claude Desktop / Cursor / VS Code
npx x402-bazaar init

# Your AI agent can now call 100+ APIs with automatic payment`;

/* ═══════════════════════════════════════════════════════════ */
export default function Quickstart() {
  useSEO({
    title: "Get Started — Your First API Call in 2 Minutes",
    description:
      "Make your first API call on x402 Bazaar in under 2 minutes. Free tier, no wallet needed. Copy-paste curl, JS, or Python snippets.",
    keywords:
      "x402 quickstart, get started, free API, curl, SDK, AI agent, HTTP 402, USDC, micropayments",
  });

  const [sdkTab, setSdkTab] = useState<Tab>("javascript");

  useEffect(() => {
    track("quickstart_view");
  }, []);

  // HowTo JSON-LD
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Make Your First API Call on x402 Bazaar",
      description:
        "Call a free API in 30 seconds with curl, then integrate the SDK for automatic payments.",
      totalTime: "PT2M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Try a free API call",
          text: "Run a curl command to call the translate API — no wallet, no signup.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Install the SDK",
          text: "npm install @wintyx/x402-sdk or pip install x402-bazaar for automatic payment handling.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Make paid calls",
          text: "Fund a wallet with USDC on SKALE, Base, or Polygon and the SDK handles payments automatically.",
        },
      ],
    };
    let el = document.getElementById(
      "quickstart-jsonld",
    ) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = "quickstart-jsonld";
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
    return () => {
      document.getElementById("quickstart-jsonld")?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* ══ Hero ══ */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-green-400 text-xs font-medium mb-6">
            <Clock className="w-3.5 h-3.5" />
            No signup &middot; No wallet &middot; No API key
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Your First API Call in{" "}
            <span className="text-[#FF9900]">2 Minutes</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            x402 Bazaar is an API marketplace where AI agents pay per call with
            USDC. Try it free right now — just copy and paste.
          </p>
        </div>

        {/* ══ Step 1: Try it free ══ */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <StepBadge n={1} />
            <div>
              <h2 className="text-xl font-semibold">Try it free</h2>
              <p className="text-gray-400 text-sm">
                5 free calls/day — no wallet, no account needed
              </p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <p className="text-gray-300 text-sm mb-3">
              Copy this curl command and paste it in your terminal:
            </p>
            <CodeBlock code={CURL_FREE} lang="bash" />
            <LiveTryIt />
          </div>
        </section>

        {/* ══ Step 2: Install the SDK ══ */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <StepBadge n={2} />
            <div>
              <h2 className="text-xl font-semibold">Install the SDK</h2>
              <p className="text-gray-400 text-sm">
                The SDK handles 402 payment flow automatically
              </p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <TabBar
              tabs={[
                { id: "javascript", label: "JavaScript" },
                { id: "python", label: "Python" },
                { id: "cli", label: "CLI" },
                { id: "curl", label: "MCP (AI Agent)" },
              ]}
              active={sdkTab}
              onChange={setSdkTab}
            />

            <div className="mt-4">
              <div
                role="tabpanel"
                id="tabpanel-javascript"
                aria-labelledby="tab-javascript"
                hidden={sdkTab !== "javascript"}
              >
                <div className="space-y-3">
                  <div className="relative">
                    <InlineCopy text="npm install @wintyx/x402-sdk" />
                    <pre className="bg-[#0d1117] border border-white/10 rounded-lg p-3 pr-12 text-sm font-mono text-gray-300">
                      <span className="text-gray-500">$</span> npm install
                      @wintyx/x402-sdk
                    </pre>
                  </div>
                  <CodeBlock code={JS_SDK} lang="javascript" />
                </div>
              </div>

              <div
                role="tabpanel"
                id="tabpanel-python"
                aria-labelledby="tab-python"
                hidden={sdkTab !== "python"}
              >
                <div className="space-y-3">
                  <div className="relative">
                    <InlineCopy text="pip install x402-bazaar" />
                    <pre className="bg-[#0d1117] border border-white/10 rounded-lg p-3 pr-12 text-sm font-mono text-gray-300">
                      <span className="text-gray-500">$</span> pip install
                      x402-bazaar
                    </pre>
                  </div>
                  <CodeBlock code={PY_SDK} lang="python" />
                </div>
              </div>

              <div
                role="tabpanel"
                id="tabpanel-cli"
                aria-labelledby="tab-cli"
                hidden={sdkTab !== "cli"}
              >
                <CodeBlock code={CLI_SNIPPET} lang="bash" />
              </div>

              <div
                role="tabpanel"
                id="tabpanel-curl"
                aria-labelledby="tab-curl"
                hidden={sdkTab !== "curl"}
              >
                <div className="space-y-3">
                  <CodeBlock code={MCP_SNIPPET} lang="bash" />
                  <p className="text-gray-400 text-xs">
                    This configures the MCP server so Claude, Cursor, or VS Code
                    can call 100+ APIs autonomously.{" "}
                    <Link to="/mcp" className="text-[#FF9900] hover:underline">
                      Full MCP guide
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ Step 3: Go further ══ */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <StepBadge n={3} />
            <div>
              <h2 className="text-xl font-semibold">Make paid calls</h2>
              <p className="text-gray-400 text-sm">
                Fund a wallet to unlock all 100+ APIs
              </p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-4">
            <p className="text-gray-300 text-sm">
              Paid APIs follow the HTTP 402 protocol: your first call returns
              payment details, you send USDC, then retry with the transaction
              hash. The SDK does this automatically.
            </p>
            <CodeBlock code={CURL_PAID} lang="bash" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                to="/fund"
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-white/20 transition-colors group"
              >
                <Wallet className="w-5 h-5 text-[#FF9900]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Fund Wallet</p>
                  <p className="text-xs text-gray-500">
                    Bridge USDC from any chain
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </Link>
              <Link
                to="/services"
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-white/20 transition-colors group"
              >
                <Blocks className="w-5 h-5 text-[#FF9900]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">API Catalog</p>
                  <p className="text-xs text-gray-500">Browse 100+ APIs</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </Link>
              <Link
                to="/playground"
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-white/20 transition-colors group"
              >
                <Terminal className="w-5 h-5 text-[#FF9900]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Playground</p>
                  <p className="text-xs text-gray-500">Try APIs in browser</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══ Why x402 ══ */}
        <section className="mb-14">
          <h3 className="text-center text-gray-500 text-xs font-medium uppercase tracking-widest mb-6">
            Why developers choose x402
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Pay per call",
                desc: "No subscriptions. No monthly fees. Pay only for what you use, starting at $0.001/call.",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "No API keys",
                desc: "The HTTP 402 protocol replaces API keys with on-chain payment proof. No signup needed.",
              },
              {
                icon: <ArrowRight className="w-5 h-5" />,
                title: "Agent-native",
                desc: "Built for AI agents. MCP server, LangChain, CrewAI, AutoGPT — agents pay autonomously.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 border border-white/10 rounded-xl p-5 text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FF9900]/10 flex items-center justify-center text-[#FF9900] mx-auto mb-3">
                  {item.icon}
                </div>
                <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ Next Steps ══ */}
        <div className="border-t border-white/10 pt-10 text-center">
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-4">
            Go deeper
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/developers"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 hover:bg-white/10 hover:border-white/20 transition-colors text-sm"
            >
              <BookOpen className="w-4 h-4 text-gray-400" />
              API Reference
            </Link>
            <Link
              to="/for-providers"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 hover:bg-white/10 hover:border-white/20 transition-colors text-sm"
            >
              <Blocks className="w-4 h-4 text-gray-400" />
              List Your API
            </Link>
            <Link
              to="/mcp"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 hover:bg-white/10 hover:border-white/20 transition-colors text-sm"
            >
              <Terminal className="w-4 h-4 text-gray-400" />
              MCP Setup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
