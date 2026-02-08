import { useTranslation } from '../i18n/LanguageContext';

export default function LanguageToggle() {
  const { lang, toggleLang } = useTranslation();
  return (
    <button
      onClick={toggleLang}
      className="flex items-center glass rounded-full px-1 py-0.5 text-xs font-medium cursor-pointer
                 transition-all duration-200 hover:border-white/15"
    >
      <span className={`px-2 py-0.5 rounded-full transition-all duration-200
        ${lang === 'en' ? 'bg-[#FF9900]/20 text-[#FF9900]' : 'text-gray-500'}`}>
        EN
      </span>
      <span className={`px-2 py-0.5 rounded-full transition-all duration-200
        ${lang === 'fr' ? 'bg-[#FF9900]/20 text-[#FF9900]' : 'text-gray-500'}`}>
        FR
      </span>
    </button>
  );
}
