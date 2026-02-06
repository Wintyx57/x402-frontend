import { useTranslation } from '../i18n/LanguageContext';

export default function LanguageToggle() {
  const { lang, toggleLang } = useTranslation();
  return (
    <button
      onClick={toggleLang}
      className="flex items-center glass rounded-full px-1 py-0.5 text-xs font-medium cursor-pointer
                 transition-all duration-300 hover:glow-blue"
    >
      <span className={`px-2 py-0.5 rounded-full transition-all duration-300
        ${lang === 'en' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-500'}`}>
        EN
      </span>
      <span className={`px-2 py-0.5 rounded-full transition-all duration-300
        ${lang === 'fr' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-500'}`}>
        FR
      </span>
    </button>
  );
}
