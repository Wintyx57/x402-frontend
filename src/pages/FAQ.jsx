import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { Link } from 'react-router-dom';

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`glass-card rounded-lg transition-all duration-200 ${
      isOpen ? 'border-[#FF9900]/20' : 'border-transparent'
    } hover:bg-white/[0.04]`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
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
  useEffect(() => { document.title = 'FAQ | x402 Bazaar'; }, []);
  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white mb-2">{t.faq.title}</h1>
        <p className="text-gray-400 text-sm mb-10">{t.faq.subtitle}</p>
      </div>

      {/* Section: General */}
      <section ref={ref1} className="reveal mb-8">
        <h2 className="text-lg font-semibold text-[#FF9900] mb-4">
          {t.faq.sectionGeneral}
        </h2>
        <div className="space-y-3">
          <FAQItem question={t.faq.q1} answer={t.faq.a1} />
          <FAQItem question={t.faq.q2} answer={t.faq.a2} />
          <FAQItem question={t.faq.q3} answer={t.faq.a3} />
        </div>
      </section>

      {/* Section: Payments */}
      <section ref={ref2} className="reveal mb-8">
        <h2 className="text-lg font-semibold text-[#FF9900] mb-4">
          {t.faq.sectionPayments}
        </h2>
        <div className="space-y-3">
          <FAQItem question={t.faq.q4} answer={t.faq.a4} />
          <FAQItem question={t.faq.q5} answer={t.faq.a5} />
          <FAQItem question={t.faq.q6} answer={t.faq.a6} />
        </div>
      </section>

      {/* Section: Technical */}
      <section ref={ref3} className="reveal mb-8">
        <h2 className="text-lg font-semibold text-[#FF9900] mb-4">
          {t.faq.sectionTechnical}
        </h2>
        <div className="space-y-3">
          <FAQItem question={t.faq.q7} answer={t.faq.a7} />
          <FAQItem question={t.faq.q8} answer={t.faq.a8} />
        </div>
      </section>

      {/* Section: Providers */}
      <section ref={ref4} className="reveal mb-8">
        <h2 className="text-lg font-semibold text-[#FF9900] mb-4">
          {t.faq.sectionProviders}
        </h2>
        <div className="space-y-3">
          <FAQItem question={t.faq.q9} answer={t.faq.a9} />
          <FAQItem question={t.faq.q10} answer={t.faq.a10} />
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
