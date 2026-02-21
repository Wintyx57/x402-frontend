import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';

function FAQItem({ question, answer, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `faq-answer-${id}`;

  return (
    <div className={`glass-card rounded-lg transition-all duration-200 ${
      isOpen ? 'border-[#FF9900]/20' : 'border-transparent'
    } hover:bg-white/[0.04]`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer bg-transparent border-none"
      >
        <h3 className="text-white font-medium text-base flex-1">{question}</h3>
        <svg
          className={`w-5 h-5 text-[#FF9900] flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
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
      </button>
      <div
        id={panelId}
        role="region"
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 px-5 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();
  useSEO({
    title: 'FAQ',
    description: 'Frequently asked questions about x402 Bazaar — payments, listing APIs, testnet, gas fees and troubleshooting.'
  });
  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();
  const ref5 = useReveal();

  // FAQPage JSON-LD Schema
  useEffect(() => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: t.faq.q1, acceptedAnswer: { '@type': 'Answer', text: t.faq.a1 } },
        { '@type': 'Question', name: t.faq.q2, acceptedAnswer: { '@type': 'Answer', text: t.faq.a2 } },
        { '@type': 'Question', name: t.faq.q3, acceptedAnswer: { '@type': 'Answer', text: t.faq.a3 } },
        { '@type': 'Question', name: t.faq.q4, acceptedAnswer: { '@type': 'Answer', text: t.faq.a4 } },
        { '@type': 'Question', name: t.faq.q5, acceptedAnswer: { '@type': 'Answer', text: t.faq.a5 } },
        { '@type': 'Question', name: t.faq.q6, acceptedAnswer: { '@type': 'Answer', text: t.faq.a6 } },
        { '@type': 'Question', name: t.faq.q7, acceptedAnswer: { '@type': 'Answer', text: t.faq.a7 } },
        { '@type': 'Question', name: t.faq.q8, acceptedAnswer: { '@type': 'Answer', text: t.faq.a8 } },
        { '@type': 'Question', name: t.faq.q9, acceptedAnswer: { '@type': 'Answer', text: t.faq.a9 } },
        { '@type': 'Question', name: t.faq.q10, acceptedAnswer: { '@type': 'Answer', text: t.faq.a10 } },
        { '@type': 'Question', name: t.faq.q11, acceptedAnswer: { '@type': 'Answer', text: t.faq.a11 } },
        { '@type': 'Question', name: t.faq.q12, acceptedAnswer: { '@type': 'Answer', text: t.faq.a12 } },
        { '@type': 'Question', name: t.faq.q13, acceptedAnswer: { '@type': 'Answer', text: t.faq.a13 } },
        { '@type': 'Question', name: t.faq.q14, acceptedAnswer: { '@type': 'Answer', text: t.faq.a14 } },
        { '@type': 'Question', name: t.faq.q15, acceptedAnswer: { '@type': 'Answer', text: t.faq.a15 } },
        { '@type': 'Question', name: t.faq.q16, acceptedAnswer: { '@type': 'Answer', text: t.faq.a16 } },
        { '@type': 'Question', name: t.faq.q17, acceptedAnswer: { '@type': 'Answer', text: t.faq.a17 } },
        { '@type': 'Question', name: t.faq.q18, acceptedAnswer: { '@type': 'Answer', text: t.faq.a18 } },
      ]
    };
    let script = document.getElementById('faq-jsonld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'faq-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqSchema);
    return () => {
      const s = document.getElementById('faq-jsonld');
      if (s) s.remove();
    };
  }, [t]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t.faq.title}</h1>
        <p className="text-gray-400 text-sm mb-10">{t.faq.subtitle}</p>
      </div>

      {/* Section: General */}
      <section ref={ref1} className="reveal mb-8">
        <h2 className="text-lg font-semibold text-[#FF9900] mb-4">
          {t.faq.sectionGeneral}
        </h2>
        <div className="space-y-3">
          <FAQItem id="1" question={t.faq.q1} answer={t.faq.a1} />
          <FAQItem id="2" question={t.faq.q2} answer={t.faq.a2} />
          <FAQItem id="3" question={t.faq.q3} answer={t.faq.a3} />
        </div>
      </section>

      {/* Section: Payments */}
      <section ref={ref2} className="reveal mb-8">
        <h2 className="text-lg font-semibold text-[#FF9900] mb-4">
          {t.faq.sectionPayments}
        </h2>
        <div className="space-y-3">
          <FAQItem id="4" question={t.faq.q4} answer={t.faq.a4} />
          <FAQItem id="5" question={t.faq.q5} answer={t.faq.a5} />
          <FAQItem id="6" question={t.faq.q6} answer={t.faq.a6} />
        </div>
      </section>

      {/* Section: Technical */}
      <section ref={ref3} className="reveal mb-8">
        <h2 className="text-lg font-semibold text-[#FF9900] mb-4">
          {t.faq.sectionTechnical}
        </h2>
        <div className="space-y-3">
          <FAQItem id="7" question={t.faq.q7} answer={t.faq.a7} />
          <FAQItem id="8" question={t.faq.q8} answer={t.faq.a8} />
        </div>
      </section>

      {/* Section: Providers */}
      <section ref={ref4} className="reveal mb-8">
        <h2 className="text-lg font-semibold text-[#FF9900] mb-4">
          {t.faq.sectionProviders}
        </h2>
        <div className="space-y-3">
          <FAQItem id="9" question={t.faq.q9} answer={t.faq.a9} />
          <FAQItem id="10" question={t.faq.q10} answer={t.faq.a10} />
        </div>
      </section>

      {/* Section: More Questions */}
      <section ref={ref5} className="reveal mb-8">
        <h2 className="text-lg font-semibold text-[#FF9900] mb-4">
          {t.faq.sectionMore}
        </h2>
        <div className="space-y-3">
          <FAQItem id="11" question={t.faq.q11} answer={t.faq.a11} />
          <FAQItem id="12" question={t.faq.q12} answer={t.faq.a12} />
          <FAQItem id="13" question={t.faq.q13} answer={t.faq.a13} />
          <FAQItem id="14" question={t.faq.q14} answer={t.faq.a14} />
          <FAQItem id="15" question={t.faq.q15} answer={t.faq.a15} />
          <FAQItem id="16" question={t.faq.q16} answer={t.faq.a16} />
          <FAQItem id="17" question={t.faq.q17} answer={t.faq.a17} />
          <FAQItem id="18" question={t.faq.q18} answer={t.faq.a18} />
        </div>
      </section>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link
          to="/integrate"
          className="gradient-btn inline-block px-8 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
        >
          {t.faq.cta || 'Start integrating'}
        </Link>
      </div>
    </div>
  );
}
