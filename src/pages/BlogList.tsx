import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/LanguageContext";
import useSEO from "../hooks/useSEO";

// Article metadata
const articles = [
  {
    slug: "01-introduction",
    title: "x402 Bazaar: 100+ APIs Your AI Agents Can Pay For with USDC",
    date: "2026-02-28",
    category: "Introduction",
    excerpt:
      "Imagine your AI agent needs to generate an image, check the weather, or scrape a website. Today, that's complicated. With HTTP 402, agents can pay for APIs autonomously, like humans swiping a credit card.",
  },
  {
    slug: "02-monetize-api",
    title: "How to Monetize Your API in 5 Minutes with HTTP 402",
    date: "2026-02-28",
    category: "Tutorials",
    excerpt:
      "You built something valuable. You want to monetize it. But traditional payment processing is painful. Here's a better way using HTTP 402 and blockchain.",
  },
  {
    slug: "03-langchain-tutorial",
    title: "Building Autonomous Agents with LangChain and x402 Bazaar",
    date: "2026-02-28",
    category: "Tutorials",
    excerpt:
      "Learn how to build LangChain agents that autonomously call paid APIs and handle payments automatically with x402 Bazaar.",
  },
  {
    slug: "04-mcp-claude-tutorial",
    title:
      "Claude Desktop Integration: Using x402 Services with Model Context Protocol",
    date: "2026-02-28",
    category: "Integrations",
    excerpt:
      "Connect x402 Bazaar to Claude Desktop via Model Context Protocol. Claude can now pay for premium APIs automatically when needed.",
  },
  {
    slug: "05-lessons-learned",
    title: "Building the Future of Autonomous APIs: Lessons Learned",
    date: "2026-02-28",
    category: "Insights",
    excerpt:
      "After launching x402 Bazaar and processing 170+ on-chain payments, here are the key lessons learned about decentralized payments for APIs.",
  },
];

export default function BlogList() {
  const { t } = useTranslation();

  useSEO({
    title: "Blog — x402 Bazaar Insights on AI Agents & HTTP 402",
    description:
      "Technical articles and guides on autonomous AI agents, HTTP 402 payment protocol, API monetization strategies, USDC micropayments on Base and SKALE, and the future of the agent economy.",
    keywords:
      "x402 Bazaar blog, HTTP 402 articles, AI agent economy blog, USDC micropayments guide, API monetization tips, autonomous agent payments",
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 no-underline"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t.blog.backHome}
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">
            Blog
          </h1>
          <p className="text-xl text-gray-400 animate-fade-in-up delay-100">
            Latest news, tutorials, and insights about x402 Bazaar and
            autonomous AI payments
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="no-underline group"
            >
              <article className="h-full glass border border-white/10 rounded-xl p-6 hover:border-[#FF9900]/30 transition-all hover:bg-white/[0.08] cursor-pointer">
                {/* Category Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(article.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-white mb-3 group-hover:text-[#FF9900] transition-colors leading-snug">
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Read More Link */}
                <div className="flex items-center gap-2 text-[#FF9900] text-sm font-medium group-hover:gap-3 transition-all">
                  Read article
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-[#FF9900]/[0.06] border border-[#FF9900]/20 rounded-xl">
          <h3 className="text-2xl font-bold text-white mb-3">
            Have feedback or ideas for a blog post?
          </h3>
          <p className="text-gray-400 mb-6">
            We're always looking for community contributions and insights. Check
            out our GitHub or reach out on social media.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/Wintyx57"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all"
            >
              View on GitHub
            </a>
            <Link
              to="/developers"
              className="glass text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:border-white/20 transition-all"
            >
              Developer Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
