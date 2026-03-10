import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../i18n/LanguageContext';

// Simple markdown to HTML parser
function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Escape HTML special characters first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Code blocks with triple backticks
  html = html.replace(
    /&lt;code&gt;([\s\S]*?)&lt;\/code&gt;/g,
    '<pre class="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto"><code class="text-sm text-gray-300 font-mono">$1</code></pre>'
  );

  html = html.replace(
    /```([^\n]*)\n([\s\S]*?)```/g,
    (_match: string, lang: string, code: string) => {
      const language = lang.trim() || 'text';
      return `<pre class="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto" data-language="${language}"><code class="text-sm text-gray-300 font-mono">${code.trim()}</code></pre>`;
    }
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-[#1a1f2e] px-2 py-0.5 rounded text-orange-400 font-mono text-sm">$1</code>'
  );

  // Headers (h1-h6)
  html = html.replace(
    /^### (.*?)$/gm,
    '<h3 class="text-xl font-semibold text-white mt-6 mb-3">$1</h3>'
  );
  html = html.replace(
    /^## (.*?)$/gm,
    '<h2 class="text-2xl md:text-3xl font-bold text-white mt-10 mb-4">$1</h2>'
  );
  html = html.replace(
    /^# (.*?)$/gm,
    '<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">$1</h1>'
  );

  // Bold
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-white font-bold">$1</strong>'
  );

  // Italic
  html = html.replace(
    /\*(.*?)\*/g,
    '<em class="italic">$1</em>'
  );

  // Links
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#FF9900] hover:text-[#FEBD69] underline">$1</a>'
  );

  // Unordered lists
  html = html.replace(
    /^- (.*?)$/gm,
    '<li class="list-disc ml-6">$1</li>'
  );
  html = html.replace(
    /(<li class="list-disc ml-6">.*?<\/li>)/s,
    (match) => {
      if (!match.includes('<ul')) {
        return `<ul class="space-y-2 my-4">$&</ul>`;
      }
      return match;
    }
  );

  // Ordered lists
  html = html.replace(
    /^\d+\. (.*?)$/gm,
    '<li class="list-decimal ml-6">$1</li>'
  );
  html = html.replace(
    /(<li class="list-decimal ml-6">.*?<\/li>)/s,
    (match) => {
      if (!match.includes('<ol')) {
        return `<ol class="space-y-2 my-4">$&</ol>`;
      }
      return match;
    }
  );

  // Horizontal rules
  html = html.replace(
    /^---$/gm,
    '<hr class="border-white/5 my-8" />'
  );

  // Paragraphs
  html = html.split('\n\n').map((para) => {
    if (
      para.startsWith('<h') ||
      para.startsWith('<ul') ||
      para.startsWith('<ol') ||
      para.startsWith('<pre') ||
      para.startsWith('<li') ||
      para.startsWith('<hr')
    ) {
      return para;
    }
    if (para.trim()) {
      return `<p class="text-gray-300 leading-relaxed my-4">${para.trim()}</p>`;
    }
    return '';
  }).join('\n');

  return html;
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  useNavigate();
  useTranslation();
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<{ title?: string; date?: string; author?: string; description?: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SEO Hook au niveau du composant
  useSEO({
    title: metadata.title || 'Article',
    description: metadata.description || metadata.title || 'Read the latest article from x402 Bazaar — AI agents, HTTP 402 protocol and USDC micropayments.',
    ogType: 'article',
  });

  // Article JSON-LD structured data
  useEffect(() => {
    if (!metadata.title) return;

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: metadata.title,
      description: metadata.description || metadata.title,
      datePublished: metadata.date || '2026-02-28',
      dateModified: metadata.date || '2026-03-05',
      url: `https://x402bazaar.org/blog/${slug}`,
      image: 'https://x402bazaar.org/og-image.png',
      author: {
        '@type': 'Person',
        name: metadata.author || 'Robin',
        url: 'https://github.com/Wintyx57',
        sameAs: ['https://github.com/Wintyx57', 'https://x.com/x402_bazaar'],
      },
      publisher: {
        '@type': 'Organization',
        name: 'x402 Bazaar',
        url: 'https://x402bazaar.org',
        logo: {
          '@type': 'ImageObject',
          url: 'https://x402bazaar.org/favicon.svg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://x402bazaar.org/blog/${slug}`,
      },
    };

    let script = document.getElementById('article-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'article-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(articleSchema);

    return () => {
      const s = document.getElementById('article-jsonld');
      if (s) s.remove();
    };
  }, [metadata, slug]);

  // Article list for navigation
  const articles = [
    { slug: '01-introduction', title: 'x402 Bazaar: 69 APIs Your AI Agents Can Pay For with USDC' },
    { slug: '02-monetize-api', title: 'How to Monetize Your API in 5 Minutes with HTTP 402' },
    { slug: '03-langchain-tutorial', title: 'Building Autonomous Agents with LangChain and x402 Bazaar' },
    { slug: '04-mcp-claude-tutorial', title: 'Claude Desktop Integration: Using x402 Services with Model Context Protocol' },
    { slug: '05-lessons-learned', title: 'Building the Future of Autonomous APIs: Lessons Learned' },
  ];

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/blog/${slug}.md`);
        if (!response.ok) {
          throw new Error('Article not found');
        }
        const text = await response.text();

        // Parse frontmatter (YAML between ---)
        const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const markdown = frontmatterMatch[2];

          // Simple YAML parsing for our needs
          const metaData: { title?: string; date?: string; author?: string } = {};
          const titleMatch = frontmatter.match(/title:\s*"?([^"\n]+)"?/);
          const dateMatch = frontmatter.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
          const authorMatch = frontmatter.match(/author:\s*([^\n]+)/);

          if (titleMatch) metaData.title = titleMatch[1];
          if (dateMatch) metaData.date = dateMatch[1];
          if (authorMatch) metaData.author = authorMatch[1];

          setMetadata(metaData);
          const html = DOMPurify.sanitize(parseMarkdown(markdown), {
            ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','a','strong','em','ul','ol','li','pre','code','hr','br'],
            ALLOWED_ATTR: ['href','target','rel','class','data-language'],
          });
          setContent(html);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin-slow" />
        <span className="text-gray-500 text-sm">Loading article...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            to="/blog"
            className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = articles.findIndex(a => a.slug === slug);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 no-underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>

        {/* Article Header */}
        <article className="text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in-up">
            {metadata.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 animate-fade-in-up delay-100">
            {metadata.author && <span>{metadata.author}</span>}
            {metadata.date && (
              <span>
                {new Date(metadata.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}
          </div>

          <hr className="border-white/10 mb-8" />

          {/* Article Content */}
          <div
            className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <hr className="border-white/5 my-8 mt-12" />

          {/* Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-12">
            {prevArticle ? (
              <Link
                to={`/blog/${prevArticle.slug}`}
                className="glass border border-white/10 rounded-xl p-4 hover:border-[#FF9900]/30 transition-all no-underline group"
              >
                <div className="text-xs text-gray-500 mb-2">← Previous Article</div>
                <div className="text-white font-semibold group-hover:text-[#FF9900] transition-colors line-clamp-2">
                  {prevArticle.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextArticle ? (
              <Link
                to={`/blog/${nextArticle.slug}`}
                className="glass border border-white/10 rounded-xl p-4 hover:border-[#FF9900]/30 transition-all no-underline group text-right"
              >
                <div className="text-xs text-gray-500 mb-2">Next Article →</div>
                <div className="text-white font-semibold group-hover:text-[#FF9900] transition-colors line-clamp-2">
                  {nextArticle.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </article>

        {/* CTA Section */}
        <div className="mt-12 p-6 bg-[#FF9900]/[0.06] border border-[#FF9900]/20 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-3">Ready to explore x402 Bazaar?</h3>
          <p className="text-gray-400 text-sm mb-4">
            Start building autonomous AI agents that can pay for APIs with USDC.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/services"
              className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all"
            >
              Explore Services
            </Link>
            <Link
              to="/blog"
              className="glass text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:border-white/20 transition-all"
            >
              All Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
