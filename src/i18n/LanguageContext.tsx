import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from './translations';

type Lang = 'en' | 'fr';
type Translations = typeof translations;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: Translations[Lang];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('x402-lang');
    return (stored === 'en' || stored === 'fr') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('x402-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang];
  const toggleLang = () => setLang(prev => prev === 'en' ? 'fr' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
}
