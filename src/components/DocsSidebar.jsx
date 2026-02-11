import { useState } from 'react';

export default function DocsSidebar({ sections, activeSection, onNavigate }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClick = (id) => {
    onNavigate(id);
    setDrawerOpen(false);
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => handleClick(id)}
          className={`text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer border-none ${
            activeSection === id
              ? 'text-[#FF9900] bg-[#FF9900]/10 font-medium'
              : 'text-gray-400 hover:text-white hover:bg-white/5 bg-transparent'
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-20">
          <NavLinks />
        </div>
      </aside>

      {/* Mobile floating button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-[#FF9900] text-white
                   flex items-center justify-center shadow-lg shadow-[#FF9900]/25 cursor-pointer border-none"
        aria-label="Open navigation"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#131921] border-r border-white/10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white font-bold text-lg">Docs</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400
                           hover:text-white cursor-pointer border-none"
              >
                ✕
              </button>
            </div>
            <NavLinks />
          </div>
        </div>
      )}
    </>
  );
}
