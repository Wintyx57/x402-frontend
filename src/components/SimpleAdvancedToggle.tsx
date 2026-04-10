import { useSimpleMode } from "../hooks/useSimpleMode";
import { useTranslation } from "../i18n/LanguageContext";

/**
 * A compact toggle placed in the footer / settings area.
 * Simple mode: hides crypto terminology for mainstream users.
 * Advanced mode: full blockchain UI.
 */
export default function SimpleAdvancedToggle({
  className = "",
}: {
  className?: string;
}) {
  const { isSimple, toggle } = useSimpleMode();
  const { t } = useTranslation();
  const sm = t.simpleMode;

  return (
    <div
      className={`inline-flex items-center gap-2 text-xs text-gray-500 select-none ${className}`}
      title={isSimple ? sm.tooltipSimple : sm.tooltipAdvanced}
    >
      <span
        className={`transition-colors duration-200 ${isSimple ? "text-white font-medium" : "text-gray-500"}`}
      >
        {sm.simple}
      </span>

      <button
        type="button"
        onClick={toggle}
        role="switch"
        aria-checked={!isSimple}
        aria-label={isSimple ? sm.switchToAdvanced : sm.switchToSimple}
        className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-300 cursor-pointer border-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]/50 ${
          isSimple ? "bg-white/10" : "bg-[#FF9900]/70"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            isSimple ? "translate-x-0" : "translate-x-4"
          }`}
          aria-hidden="true"
        />
      </button>

      <span
        className={`transition-colors duration-200 ${!isSimple ? "text-white font-medium" : "text-gray-500"}`}
      >
        {sm.advanced}
      </span>
    </div>
  );
}
