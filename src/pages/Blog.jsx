import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export default function Blog() {
  const { t } = useTranslation();

  useEffect(() => { document.title = `${t.blog.title} | x402 Bazaar`; }, [t]);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 no-underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.blog.backHome}
        </Link>

        {/* Article Header */}
        <article className="text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in-up">
            {t.blog.articleTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-8 animate-fade-in-up delay-100">
            {t.blog.articleSubtitle}
          </p>

          <hr className="border-white/10 mb-8" />

          {/* Article Content */}
          <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
            <p>{t.blog.intro1}</p>
            <p>{t.blog.intro2}</p>
            <p>{t.blog.intro3}</p>
            <p>
              {t.blog.intro4Launch} <strong className="text-white">{t.blog.intro4Product}</strong> {t.blog.intro4Desc}
            </p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.problemTitle}
            </h2>

            <p>{t.blog.problem1}</p>
            <p>{t.blog.problem2}</p>
            <p>{t.blog.problem3}</p>
            <p>{t.blog.problem4}</p>
            <p>{t.blog.problem5}</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.solutionTitle}
            </h2>

            <p>{t.blog.solution1}</p>

            <p><strong className="text-white">{t.blog.solutionAgents}</strong></p>

            <p>{t.blog.solution2}</p>

            <p><strong className="text-white">{t.blog.solutionPayments}</strong></p>

            <p>
              {t.blog.solution3} <code className="bg-[#1a1f2e] px-2 py-0.5 rounded text-orange-400">{t.blog.solution3Code}</code> {t.blog.solution3End}
            </p>

            <p>{t.blog.solution4}</p>

            <p><strong className="text-white">{t.blog.solutionMicro}</strong></p>

            <p>{t.blog.solution5}</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.technicalTitle}
            </h2>

            <p>{t.blog.technicalIntro}</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">{t.blog.step1Title}</h3>

            <p>{t.blog.step1Desc}</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`GET /api/services
Host: x402-api.onrender.com`}
              </pre>
            </div>

            <p>{t.blog.step1Result}</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">{t.blog.step2Title}</h3>

            <p>{t.blog.step2Desc}</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`POST /api/services/search
Host: x402-api.onrender.com
Content-Type: application/json

{
  "query": "latest AI research papers 2026"
}`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">{t.blog.step3Title}</h3>

            <p>{t.blog.step3Desc}</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "price": "0.01",
  "currency": "USDC",
  "recipient": "0x1234...abcd",
  "chains": ["base", "skale-europa"],
  "message": "Payment required to access this service"
}`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">{t.blog.step4Title}</h3>

            <p>{t.blog.step4Desc} <code className="bg-[#1a1f2e] px-2 py-0.5 rounded text-green-400">0xabcdef...</code>.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">{t.blog.step5Title}</h3>

            <p>{t.blog.step5Desc}</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`POST /api/services/search
Host: x402-api.onrender.com
Content-Type: application/json
X-Payment-TxHash: 0xabcdef...

{
  "query": "latest AI research papers 2026"
}`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">{t.blog.step6Title}</h3>

            <p>{t.blog.step6Desc}</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "results": [
    {
      "title": "Scaling Autonomous Agents with Multi-Modal Reasoning",
      "url": "https://arxiv.org/abs/...",
      "snippet": "..."
    },
    ...
  ]
}`}
              </pre>
            </div>

            <p>{t.blog.step6End}</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.securityTitle}
            </h2>

            <p>{t.blog.securityIntro}</p>

            <p>
              <strong className="text-white">{t.blog.securityReplay}</strong> {t.blog.securityReplayDesc}
            </p>

            <p>
              <strong className="text-white">{t.blog.securityUsdc}</strong> {t.blog.securityUsdcDesc}
            </p>

            <p>
              <strong className="text-white">{t.blog.securitySsrf}</strong> {t.blog.securitySsrfDesc}
            </p>

            <p>
              <strong className="text-white">{t.blog.securitySpam}</strong> {t.blog.securitySpamDesc}
            </p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.marketplaceTitle}
            </h2>

            <p>{t.blog.marketplaceIntro}</p>

            <p><strong className="text-white">{t.blog.marketplaceNative}</strong> {t.blog.marketplaceNativeDesc}</p>

            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-white/10 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#1a1f2e]">
                    <th className="border border-white/10 px-4 py-2 text-left text-white font-semibold">{t.blog.tableService}</th>
                    <th className="border border-white/10 px-4 py-2 text-left text-white font-semibold">{t.blog.tableDescription}</th>
                    <th className="border border-white/10 px-4 py-2 text-left text-white font-semibold">{t.blog.tablePrice}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceSearch}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceSearchDesc}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceSearchPrice}</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceScraper}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceScraperDesc}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceScraperPrice}</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceTwitter}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceTwitterDesc}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceTwitterPrice}</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceWeather}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceWeatherDesc}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceWeatherPrice}</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceCrypto}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceCryptoDesc}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceCryptoPrice}</td>
                  </tr>
                  <tr>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceJoke}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceJokeDesc}</td>
                    <td className="border border-white/10 px-4 py-2">{t.blog.serviceJokePrice}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p><strong className="text-white">{t.blog.marketplaceThirdParty}</strong> {t.blog.marketplaceThirdPartyDesc}</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.mcpTitle}
            </h2>

            <p>{t.blog.mcpDesc1} <strong className="text-white">{t.blog.mcpDescHighlight}</strong> {t.blog.mcpDesc2}</p>

            <p>{t.blog.mcpOnceConnected}</p>

            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t.blog.mcpFeature1}</li>
              <li>{t.blog.mcpFeature2}</li>
              <li>{t.blog.mcpFeature3}</li>
              <li>{t.blog.mcpFeature4}</li>
            </ul>

            <p>{t.blog.mcpConversation}</p>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 my-4">
              <p className="mb-3">
                <strong className="text-white">{t.blog.mcpYou}</strong> <span className="text-gray-300">{t.blog.mcpYouPrompt}</span>
              </p>
              <p>
                <strong className="text-white">{t.blog.mcpClaude}</strong> <span className="text-gray-300">{t.blog.mcpClaudeResponse}</span>
              </p>
              <ul className="list-none ml-4 mt-2 space-y-1 text-gray-300">
                <li>- {t.blog.mcpResult1}</li>
                <li>- {t.blog.mcpResult2}</li>
                <li>- {t.blog.mcpResult3}</li>
              </ul>
              <p className="mt-2 text-gray-300">{t.blog.mcpResultSummary}</p>
            </div>

            <p>{t.blog.mcpConclusion}</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.getStartedTitle}
            </h2>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">{t.blog.getStartedCommand}</pre>
            </div>

            <p>{t.blog.getStartedDesc}</p>

            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>{t.blog.getStartedStep1}</li>
              <li>{t.blog.getStartedStep2}</li>
              <li>{t.blog.getStartedStep3}</li>
              <li>{t.blog.getStartedStep4}</li>
            </ol>

            <p>{t.blog.getStartedConclusion}</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.coinbaseTitle}
            </h2>

            <p>
              {t.blog.coinbase1} <strong className="text-white">{t.blog.coinbase1Highlight}</strong> {t.blog.coinbase1End}
            </p>

            <p>{t.blog.coinbase2}</p>

            <p>{t.blog.coinbase3}</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.bigPictureTitle}
            </h2>

            <p>{t.blog.bigPicture1}</p>

            <p>{t.blog.bigPicture2}</p>

            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong className="text-white">{t.blog.bigPicture3a}</strong> {t.blog.bigPicture3aDesc}</li>
              <li><strong className="text-white">{t.blog.bigPicture3b}</strong> {t.blog.bigPicture3bDesc}</li>
              <li><strong className="text-white">{t.blog.bigPicture3c}</strong> {t.blog.bigPicture3cDesc}</li>
            </ol>

            <p>{t.blog.bigPicture4}</p>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.linksTitle}
            </h2>

            <ul className="list-none space-y-2">
              <li>
                <strong className="text-white">{t.blog.linkWebsite}</strong>{' '}
                <a href="https://x402bazaar.org" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  x402bazaar.org
                </a>
              </li>
              <li>
                <strong className="text-white">{t.blog.linkGithubFrontend}</strong>{' '}
                <a href="https://github.com/Wintyx57/x402-frontend" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  github.com/Wintyx57/x402-frontend
                </a>
              </li>
              <li>
                <strong className="text-white">{t.blog.linkGithubBackend}</strong>{' '}
                <a href="https://github.com/Wintyx57/x402-backend" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  github.com/Wintyx57/x402-backend
                </a>
              </li>
              <li>
                <strong className="text-white">{t.blog.linkApi}</strong>{' '}
                <a href="https://x402-api.onrender.com" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  x402-api.onrender.com
                </a>
              </li>
              <li>
                <strong className="text-white">{t.blog.linkProtocol}</strong>{' '}
                <a href="https://www.x402.org/" target="_blank" rel="noopener noreferrer" className="text-[#FF9900] hover:text-[#FEBD69] underline">
                  x402.org
                </a>
              </li>
              <li>
                <strong className="text-white">{t.blog.linkHackathon}</strong> {t.blog.linkHackathonDesc}
              </li>
            </ul>

            <hr className="border-white/5 my-8" />

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-10 mb-4">
              {t.blog.tryItTitle}
            </h2>

            <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">{t.blog.getStartedCommand}</pre>
            </div>

            <p className="text-lg">
              {t.blog.tryItConclusion}
            </p>

            <hr className="border-white/5 my-8" />

            <p className="text-sm text-gray-500 italic">
              {t.blog.disclaimer}
            </p>
          </div>

          {/* CTA Section */}
          <div className="mt-12 p-6 bg-[#FF9900]/[0.06] border border-[#FF9900]/20 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-3">{t.blog.ctaTitle}</h3>
            <p className="text-gray-400 text-sm mb-4">
              {t.blog.ctaDesc} <code className="bg-[#1a1f2e] px-2 py-1 rounded text-[#FF9900]">{t.blog.getStartedCommand}</code>
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/services"
                className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all"
              >
                {t.blog.ctaExplore}
              </Link>
              <Link
                to="/developers"
                className="glass text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:border-white/20 transition-all"
              >
                {t.blog.ctaDocs}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
