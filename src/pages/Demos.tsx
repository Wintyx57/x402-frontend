import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';
import { Search, Radar, Sparkles, TrendingUp, Coins } from 'lucide-react';

export default function Demos() {
  const { t } = useTranslation();
  useSEO({
    title: 'Agent Demos',
    description: 'Watch AI agents use x402 Bazaar in action. Live demos with code examples for autonomous API consumption.'
  });
  const revealRef = useReveal();
  const scenariosRef = useReveal();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16" ref={revealRef}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t.demos.title}
        </h1>
        <p className="text-gray-400 text-sm">
          {t.demos.subtitle}
        </p>
      </div>

      {/* Featured Demo: Autonomous Agent */}
      <section className="mb-16">
        <div className="glass-card rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">
              {t.demos.featuredTitle}
            </h2>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            {t.demos.featuredDesc}
          </p>

          {/* Code Block */}
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-3 sm:p-5 font-mono text-xs sm:text-sm overflow-x-auto">
            <pre className="text-gray-300">
              <span className="text-gray-500">// Autonomous x402 Agent</span>{'\n'}
              <span className="text-[#FF9900]">const</span> agent = <span className="text-[#FF9900]">new</span> <span className="text-white">X402Agent</span>({'{'} budget: <span className="text-[#34D399]">"1.00 USDC"</span> {'}'});{'\n\n'}

              <span className="text-gray-500">// 1. Discover services</span>{'\n'}
              <span className="text-[#FF9900]">const</span> services = <span className="text-[#FF9900]">await</span> agent.<span className="text-white">discover</span>(<span className="text-[#34D399]">"weather API"</span>);{'\n\n'}

              <span className="text-gray-500">// 2. Agent pays automatically (HTTP 402 → USDC → retry)</span>{'\n'}
              <span className="text-[#FF9900]">const</span> weather = <span className="text-[#FF9900]">await</span> agent.<span className="text-white">call</span>(services[<span className="text-[#34D399]">0</span>].url, {'{'} city: <span className="text-[#34D399]">"Paris"</span> {'}'});{'\n\n'}

              <span className="text-gray-500">// 3. Chain multiple APIs</span>{'\n'}
              <span className="text-[#FF9900]">const</span> news = <span className="text-[#FF9900]">await</span> agent.<span className="text-white">call</span>(<span className="text-[#34D399]">"/api/search"</span>, {'{'} q: weather.summary {'}'});{'\n'}
              <span className="text-[#FF9900]">const</span> report = <span className="text-[#FF9900]">await</span> agent.<span className="text-white">call</span>(<span className="text-[#34D399]">"/api/scrape"</span>, {'{'} url: news[<span className="text-[#34D399]">0</span>].url {'}'});{'\n\n'}

              <span className="text-white">console</span>.<span className="text-white">log</span>(report); <span className="text-gray-500">// Full autonomous pipeline!</span>
            </pre>
          </div>
        </div>
      </section>

      {/* Multi-API Scenarios Grid */}
      <section ref={scenariosRef}>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {t.demos.scenariosTitle}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1 - Research Agent */}
          <div className="glass-card rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-[#FF9900]/10 flex items-center justify-center text-[#FF9900] mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold text-base mb-2">
              {t.demos.scenario1Title}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {t.demos.scenario1Desc}
            </p>
            <div className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2 font-mono">
              {t.demos.scenario1Flow}
            </div>
            <div className="text-xs text-[#34D399] font-mono mt-3 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> {t.demos.scenario1Cost}
            </div>
          </div>

          {/* Card 2 - Social Monitor */}
          <div className="glass-card rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
              <Radar className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold text-base mb-2">
              {t.demos.scenario2Title}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {t.demos.scenario2Desc}
            </p>
            <div className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2 font-mono">
              {t.demos.scenario2Flow}
            </div>
            <div className="text-xs text-[#34D399] font-mono mt-3 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> {t.demos.scenario2Cost}
            </div>
          </div>

          {/* Card 3 - Content Creator */}
          <div className="glass-card rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold text-base mb-2">
              {t.demos.scenario3Title}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {t.demos.scenario3Desc}
            </p>
            <div className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2 font-mono">
              {t.demos.scenario3Flow}
            </div>
            <div className="text-xs text-[#34D399] font-mono mt-3 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> {t.demos.scenario3Cost}
            </div>
          </div>

          {/* Card 4 - Financial Analyst */}
          <div className="glass-card rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold text-base mb-2">
              {t.demos.scenario4Title}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {t.demos.scenario4Desc}
            </p>
            <div className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2 font-mono">
              {t.demos.scenario4Flow}
            </div>
            <div className="text-xs text-[#34D399] font-mono mt-3 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> {t.demos.scenario4Cost}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <div className="text-center mt-16">
        <Link to="/integrate" className="gradient-btn inline-block px-8 py-3 rounded-lg text-white font-medium no-underline hover:brightness-110 transition-all">
          {t.demos.ctaButton}
        </Link>
      </div>
    </div>
  );
}
