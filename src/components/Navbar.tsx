import {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "../i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import DarkModeToggle from "./DarkModeToggle";

// Lazy-load WalletInfo to defer wagmi hooks (vendor-web3) + thirdweb ConnectButton
// from the initial bundle. Renders a placeholder until providers are ready.
const WalletInfo = lazy(() => import("./WalletInfo"));

type DropdownId = "developers" | "providers" | null;

interface NavLink {
  to: string;
  label: string;
}

interface NavDropdownProps {
  id: DropdownId;
  label: string;
  links: NavLink[];
  openDropdown: DropdownId;
  setOpenDropdown: (id: DropdownId) => void;
  pathname: string;
}

function NavDropdown({
  id,
  label,
  links,
  openDropdown,
  setOpenDropdown,
  pathname,
}: NavDropdownProps) {
  const isOpen = openDropdown === id;
  const hasActive = links.some(
    (l) => pathname === l.to || pathname.startsWith(l.to + "/"),
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Escape") {
      setOpenDropdown(null);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpenDropdown(id);
      setTimeout(() => {
        const menu = document.querySelector(`[data-dropdown="${id}"]`);
        if (menu)
          (menu.querySelector('[role="menuitem"]') as HTMLElement)?.focus();
      }, 50);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpenDropdown(isOpen ? null : id)}
        onKeyDown={handleKeyDown}
        className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer
          ${hasActive ? "text-[#FF9900]" : "text-gray-300 hover:text-white hover:bg-white/5"}
          ${isOpen ? "bg-white/5" : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {hasActive && (
          <span
            className="w-1 h-1 rounded-full bg-[#FF9900] shrink-0"
            aria-hidden="true"
          />
        )}
        {label}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          data-dropdown={id}
          className="absolute top-full left-0 mt-1.5 min-w-[200px] rounded-xl py-1.5 z-50 animate-fade-in
                     bg-[#131921]/95 dark:bg-[#131921]/95 backdrop-blur-2xl
                     border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        >
          {links.map(({ to, label: linkLabel }) => {
            const isActive = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpenDropdown(null)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 text-sm no-underline px-4 py-2 mx-1.5 rounded-lg transition-colors duration-150 ${
                  isActive
                    ? "text-[#FF9900] bg-[#FF9900]/10"
                    : "text-gray-300 hover:text-white hover:bg-white/8"
                }`}
              >
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#FF9900] shrink-0"
                    aria-hidden="true"
                  />
                )}
                {linkLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClearSearch: () => void;
  placeholder: string;
}

function SearchOverlay({
  open,
  onClose,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  placeholder,
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="max-w-xl mx-auto mt-20 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            onSearchSubmit(e);
            onClose();
          }}
          role="search"
        >
          <div className="relative flex items-center">
            <label htmlFor="overlay-search" className="sr-only">
              {placeholder}
            </label>
            <input
              ref={inputRef}
              id="overlay-search"
              type="search"
              value={searchValue}
              onChange={onSearchChange}
              placeholder={placeholder}
              autoComplete="off"
              className="w-full bg-[#131921]/95 backdrop-blur-2xl border border-white/15 rounded-xl
                         pl-11 pr-10 py-3.5 text-base text-white placeholder-gray-500
                         focus:outline-none focus:border-[#FF9900]/50 focus:ring-1 focus:ring-[#FF9900]/20
                         shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200"
            />
            <svg
              className="absolute left-3.5 w-5 h-5 text-gray-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchValue && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-3 w-5 h-5 flex items-center justify-center text-gray-500
                           hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none p-0"
                aria-label="Clear search"
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [mobileAccordion, setMobileAccordion] = useState<DropdownId>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [freeBannerDismissed, setFreeBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("x402-free-banner-dismissed") === "1";
    } catch {
      return false;
    }
  });
  const showFreeBanner = !freeBannerDismissed;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navLinksRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const onServicesPage =
    pathname === "/services" || pathname.startsWith("/services/");
  const searchValue = onServicesPage
    ? searchParams.get("q") || ""
    : localSearch;

  const closeMobile = () => setMobileOpen(false);

  // Scroll detection for glass effect intensity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleCmdK);
    return () => document.removeEventListener("keydown", handleCmdK);
  }, []);

  // Close dropdown on click outside or Escape
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      navLinksRef.current &&
      !navLinksRef.current.contains(e.target as Node)
    ) {
      setOpenDropdown(null);
    }
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpenDropdown(null);
      setMobileOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleClickOutside, handleEscape]);

  // Close menu on route change
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenDropdown(null);
      setMobileOpen(false);
    }
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileOpen) return;

    const panel = mobilePanelRef.current;
    if (!panel) return;

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const getFocusableElements = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelectors),
      ).filter((el) => !el.closest('[aria-hidden="true"]'));

    const firstFocusable = getFocusableElements()[0];
    firstFocusable?.focus();

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleFocusTrap);
    return () => {
      document.removeEventListener("keydown", handleFocusTrap);
    };
  }, [mobileOpen]);

  const clearSearch = () => {
    if (onServicesPage) {
      const params = new URLSearchParams(searchParams);
      params.delete("q");
      setSearchParams(params);
    } else {
      setLocalSearch("");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onServicesPage) {
      const params = new URLSearchParams(searchParams);
      if (val) {
        params.set("q", val);
      } else {
        params.delete("q");
      }
      setSearchParams(params);
    } else {
      setLocalSearch(val);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onServicesPage) return;
    if (localSearch.trim()) {
      navigate(`/services?q=${encodeURIComponent(localSearch.trim())}`);
      setLocalSearch("");
    }
  };

  const developerLinks: NavLink[] = [
    { to: "/quickstart", label: t.nav.quickstart || "Quickstart" },
    { to: "/integrate", label: t.nav.integrate },
    { to: "/playground", label: t.nav.playground },
    { to: "/agent", label: t.nav.liveAgent || "Live Agent" },
    { to: "/compare", label: t.nav.compare },
  ];

  const providerLinks: NavLink[] = [
    { to: "/for-providers", label: t.nav.whyX402 || "Why x402?" },
    { to: "/register", label: t.nav.register },
    {
      to: "/register?mode=quick",
      label: t.nav.quickMonetize || "Quick Monetize",
    },
    {
      to: "/import",
      label:
        (t.nav as Record<string, string>).importOpenAPI || "Import OpenAPI",
    },
    {
      to: "/register?mode=paylink",
      label: (t.nav as Record<string, string>).paymentLinks || "Payment Links",
    },
  ];

  const dropdownGroups = [
    {
      id: "developers" as DropdownId,
      label: t.nav.forDevelopers,
      links: developerLinks,
    },
    {
      id: "providers" as DropdownId,
      label: t.nav.forProviders,
      links: providerLinks,
    },
  ];

  const isApisActive =
    pathname === "/services" || pathname.startsWith("/services/");
  const isDocsActive = pathname === "/docs" || pathname.startsWith("/docs/");

  const dismissFreeBanner = () => {
    setFreeBannerDismissed(true);
    try {
      sessionStorage.setItem("x402-free-banner-dismissed", "1");
    } catch {
      /* private browsing */
    }
  };

  return (
    <>
      {/* Spacer — reserves space for the fixed navbar + optional free tier bar */}
      <div className={showFreeBanner ? "h-[88px]" : "h-14"} />

      {/* Free Tier announcement bar */}
      {showFreeBanner && (
        <div
          className="fixed top-0 left-0 right-0 z-[51] flex items-center justify-center gap-3
                        px-4 py-[7px]
                        bg-gradient-to-r from-[#34D399]/[0.07] via-[#34D399]/[0.03] to-[#34D399]/[0.07]
                        border-b border-[#34D399]/10 backdrop-blur-md"
        >
          <span className="text-[10px] font-bold text-[#0a0a0f] bg-[#34D399] px-[6px] py-[1px] rounded uppercase tracking-wide leading-tight">
            {(t.nav as Record<string, string>).freeBadge || "Free"}
          </span>
          <span className="text-[13px] text-white/70">
            <strong className="text-white font-semibold">
              {(t.nav as Record<string, string>).freeBannerHighlight ||
                "95 APIs"}
            </strong>{" "}
            {(t.nav as Record<string, string>).freeBannerText ||
              "available without wallet \u2014 5 calls/day"}
          </span>
          <Link
            to="/services?filter=free-trial"
            className="text-[12px] text-[#34D399] no-underline font-medium hover:text-[#6EE7B7] transition-colors"
          >
            {(t.nav as Record<string, string>).freeBannerLink || "Explore"}
          </Link>
          <button
            onClick={dismissFreeBanner}
            className="ml-1 text-white/20 hover:text-white/50 transition-colors bg-transparent border-none cursor-pointer p-0 leading-none text-base"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}

      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          showFreeBanner ? "top-[32px]" : "top-0"
        } ${
          scrolled
            ? "bg-[#0f1219]/85 backdrop-blur-2xl border-b border-white/12 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "bg-transparent backdrop-blur-sm border-b border-transparent"
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 no-underline shrink-0"
            aria-label="x402 Bazaar — Home"
          >
            <span className="text-[#FF9900] font-bold text-xl">x402</span>
            <span className="hidden sm:inline text-white text-lg font-light">
              Bazaar
            </span>
          </Link>

          {/* Desktop nav links */}
          <div
            ref={navLinksRef}
            className="hidden md:flex items-center gap-1 ml-4"
          >
            {/* APIs — direct link */}
            <Link
              to="/services"
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 whitespace-nowrap no-underline ${
                isApisActive
                  ? "text-[#FF9900]"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.nav.apis || "APIs"}
            </Link>

            {/* Dropdowns */}
            {dropdownGroups.map(({ id, label, links }) => (
              <NavDropdown
                key={id}
                id={id}
                label={label}
                links={links}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                pathname={pathname}
              />
            ))}

            {/* Docs — direct link */}
            <Link
              to="/docs"
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 whitespace-nowrap no-underline ${
                isDocsActive
                  ? "text-[#FF9900]"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.nav.docs}
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search button — compact Ctrl+K */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300
                         bg-white/5 hover:bg-white/8 border border-white/10 rounded-lg
                         px-2.5 py-1.5 transition-all duration-200 cursor-pointer"
              aria-label="Search (Ctrl+K)"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <kbd className="text-[10px] font-mono text-gray-600 bg-white/5 px-1 py-0.5 rounded">
                Ctrl+K
              </kbd>
            </button>

            <DarkModeToggle />
            <LanguageToggle />
            <Suspense
              fallback={<div className="h-7 w-20 animate-shimmer rounded-lg" />}
            >
              <WalletInfo />
            </Suspense>

            {/* CTA — List Your API (desktop) */}
            <Link
              to="/register"
              className="hidden md:inline-flex items-center gap-1 gradient-btn text-white text-xs font-semibold
                         px-3.5 py-1.5 rounded-lg no-underline transition-all duration-200 hover:brightness-110 whitespace-nowrap"
            >
              {t.nav.listYourApi || "List Your API"}
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

            {/* Mobile hamburger */}
            <button
              ref={hamburgerRef}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-[5px]
                         bg-transparent border-none cursor-pointer z-50 rounded-lg
                         hover:bg-white/5 transition-colors duration-200"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              <span
                className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${
                  mobileOpen
                    ? "translate-y-[7px] rotate-45 bg-[#FF9900]"
                    : "bg-gray-300"
                }`}
              />
              <span
                className={`block w-5 h-[2px] rounded-full transition-all duration-300 ${
                  mobileOpen
                    ? "opacity-0 scale-x-0 bg-[#FF9900]"
                    : "bg-gray-300"
                }`}
              />
              <span
                className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${
                  mobileOpen
                    ? "-translate-y-[7px] -rotate-45 bg-[#FF9900]"
                    : "bg-gray-300"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu — slide-in overlay */}
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
            showFreeBanner ? "top-[88px]" : "top-14"
          } ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Panel — slides in from left */}
          <div
            ref={mobilePanelRef}
            className={`relative w-[280px] max-w-[85vw] h-full bg-[#0f1219]/95 backdrop-blur-2xl border-r border-white/10
                        flex flex-col transition-transform duration-300 ease-out shadow-[4px_0_30px_rgba(0,0,0,0.4)] ${
                          mobileOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
          >
            {/* Mobile search */}
            <div className="p-4 border-b border-white/8">
              <form
                onSubmit={(e) => {
                  handleSearch(e);
                  closeMobile();
                }}
                role="search"
              >
                <div className="relative flex items-center">
                  <label htmlFor="mobile-search" className="sr-only">
                    {t.nav.searchPlaceholder}
                  </label>
                  <input
                    id="mobile-search"
                    type="search"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder={t.nav.searchPlaceholder}
                    autoComplete="off"
                    className="w-full bg-white/8 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white
                               placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50
                               transition-all duration-200"
                  />
                  <svg
                    className="absolute left-3 w-4 h-4 text-gray-500 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </form>
            </div>

            {/* Nav items */}
            <nav
              className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1"
              aria-label="Mobile navigation links"
            >
              {/* Direct link: APIs */}
              <Link
                to="/services"
                onClick={closeMobile}
                className={`flex items-center gap-2 text-sm no-underline px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 ${
                  isApisActive
                    ? "text-[#FF9900] bg-[#FF9900]/8"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {isApisActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#FF9900]"
                    aria-hidden="true"
                  />
                )}
                {t.nav.apis || "APIs"}
              </Link>

              {/* Accordion groups */}
              {dropdownGroups.map(({ id, label, links }) => {
                const isAccordionOpen = mobileAccordion === id;
                const hasActive = links.some(
                  (l) => pathname === l.to || pathname.startsWith(l.to + "/"),
                );
                return (
                  <div key={id}>
                    <button
                      onClick={() =>
                        setMobileAccordion(isAccordionOpen ? null : id)
                      }
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-colors duration-200 cursor-pointer
                        ${hasActive ? "text-[#FF9900] bg-[#FF9900]/8" : "text-gray-300 hover:text-white hover:bg-white/5"}
                        ${isAccordionOpen ? "bg-white/5" : ""}`}
                      aria-expanded={isAccordionOpen}
                    >
                      <span className="flex items-center gap-2">
                        {hasActive && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#FF9900]"
                            aria-hidden="true"
                          />
                        )}
                        {label}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isAccordionOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                      className={`overflow-hidden transition-all duration-250 ${
                        isAccordionOpen
                          ? "max-h-60 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-4 flex flex-col gap-0.5 pb-1 pt-0.5">
                        {links.map(({ to, label: linkLabel }) => {
                          const isActive =
                            pathname === to || pathname.startsWith(to + "/");
                          return (
                            <Link
                              key={to}
                              to={to}
                              onClick={closeMobile}
                              className={`flex items-center gap-2 text-sm no-underline px-3 py-2 rounded-lg transition-colors duration-200 ${
                                isActive
                                  ? "text-[#FF9900] bg-[#FF9900]/10 font-medium"
                                  : "text-gray-300 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {isActive && (
                                <span
                                  className="w-1 h-1 rounded-full bg-[#FF9900] shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                              {linkLabel}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Direct link: Docs */}
              <Link
                to="/docs"
                onClick={closeMobile}
                className={`flex items-center gap-2 text-sm no-underline px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 ${
                  isDocsActive
                    ? "text-[#FF9900] bg-[#FF9900]/8"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {isDocsActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#FF9900]"
                    aria-hidden="true"
                  />
                )}
                {t.nav.docs}
              </Link>
            </nav>

            {/* Bottom — Register CTA */}
            <div className="p-4 border-t border-white/8">
              <Link
                to="/register"
                onClick={closeMobile}
                className="block w-full gradient-btn text-white text-center text-sm font-semibold
                           py-2.5 rounded-xl no-underline transition-all duration-200 hover:brightness-110"
              >
                {t.nav.listYourApiCta || "List Your API — 95% Revenue"}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search overlay (Ctrl+K) */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearch}
        onClearSearch={clearSearch}
        placeholder={t.nav.searchPlaceholder}
      />
    </>
  );
}

Navbar.displayName = "Navbar";
export default memo(Navbar);
