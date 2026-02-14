import { useTheme } from '../context/ThemeContext';

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-8 h-8 min-h-[44px] sm:min-h-0 sm:w-7 sm:h-7 flex items-center justify-center
                 rounded-full glass cursor-pointer transition-all duration-300
                 hover:border-white/15 light:hover:border-gray-300"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
    >
      {/* Sun icon (shown in dark mode, click to go light) */}
      <svg
        className={`w-4 h-4 absolute transition-all duration-300 ${
          isLight ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
        fill="none"
        stroke="#FF9900"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>

      {/* Moon icon (shown in light mode, click to go dark) */}
      <svg
        className={`w-4 h-4 absolute transition-all duration-300 ${
          isLight ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
        fill="none"
        stroke="#6B7280"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </button>
  );
}
