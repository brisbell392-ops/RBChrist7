import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { ActiveTab } from '../types/ministry';

interface NavbarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  isAdmin: boolean;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'sermons', label: 'Sermons' },
  { id: 'bible', label: 'Bible' },
  { id: 'daily-verse', label: 'Daily Verse' },
  { id: 'songs', label: 'Songs' },
];

export function Navbar({ activeTab, onNavigate, isAdmin }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (tab: ActiveTab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5DEC9] bg-[#FAF7F2]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="font-display cursor-pointer whitespace-nowrap shrink-0 text-left text-2xl font-bold tracking-tight text-[#1C1917] transition-colors hover:text-[#9A3412] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3A5F]"
        >
          Righteous Branch
        </button>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`cursor-pointer whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3A5F] ${
                  active
                    ? 'border-[#9A3412] text-[#1C1917]'
                    : 'border-transparent text-[#57534E] hover:border-[#D6CEBE] hover:text-[#1C1917]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('admin')}
            aria-current={activeTab === 'admin' ? 'page' : undefined}
            className={`cursor-pointer whitespace-nowrap shrink-0 rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] ${
              activeTab === 'admin'
                ? 'bg-[#9A3412] text-white'
                : 'bg-[#1E3A5F] text-white hover:bg-[#162C49]'
            }`}
          >
            {isAdmin ? 'Admin Panel' : 'Admin'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#E5DEC9] bg-white text-[#1C1917] md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[#E5DEC9] bg-[#FAF7F2] px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`flex min-h-[44px] items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#F2ECE1] text-[#9A3412]'
                      : 'text-[#44403C] hover:bg-[#F2ECE1]/60'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
