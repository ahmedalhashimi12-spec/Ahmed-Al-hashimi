import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAVIGATION_ITEMS } from "../data";
import { NavigationItem } from "../types";

interface HeaderProps {
  activeSectionId: string;
  onNavigate: (item: NavigationItem) => void;
}

export default function Header({ activeSectionId, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    onNavigate({ id: "hero", label: "Hero", scrollRatio: 0 });
    setMobileMenuOpen(false);
  };

  const handleNavItemClick = (item: NavigationItem) => {
    onNavigate(item);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 md:top-[64px] md:left-[64px] md:right-[64px] flex items-center justify-between z-40 pointer-events-auto">
        {/* Logo and Subtitle group */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-4 cursor-pointer select-none group"
        >
          <div className="hidden sm:flex flex-col text-right font-manrope font-normal text-[11px] sm:text-[12px] leading-[15px] sm:leading-[16px] text-white opacity-80 group-hover:opacity-100 transition-opacity">
            <span>تكريم للعالم العراقي د. عبد الجبار عبد الله</span>
            <span>تلميذ ألبرت أينشتاين النجيب</span>
            <span>ورئيس جامعة بغداد الأسبق</span>
          </div>
        </div>

        {/* Desktop navigation menu */}
        <nav className="hidden md:flex items-center gap-8 font-manrope text-[14px] font-semibold">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = activeSectionId === item.id;
            
            if (item.id === "about") {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item)}
                  className={`px-5 py-2 border rounded-full transition-all duration-300 cursor-pointer ${
                    isActive || activeSectionId === "about"
                      ? "bg-white text-[#11010a] border-white"
                      : "border-white/25 text-white hover:bg-white hover:text-[#11010a] hover:border-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item)}
                className={`transition-colors duration-300 cursor-pointer py-1 ${
                  isActive
                    ? "text-[#FF005E] font-bold drop-shadow-[0_0_8px_rgba(255,0,94,0.4)]"
                    : "text-white hover:text-[#FF005E]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile menu trigger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-colors focus:outline-none"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Full-screen Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#11010a]/98 backdrop-blur-xl z-30 md:hidden flex flex-col justify-center px-8 border-r border-white/5">
          <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = activeSectionId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item)}
                  className={`w-full text-right font-manrope text-[16px] py-4 border-b border-white/5 flex flex-row-reverse justify-between items-center transition-all ${
                    isActive
                      ? "text-[#FF005E] font-semibold border-b-[#FF005E]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF005E] filter drop-shadow-[0_0_4px_#FF005E]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
