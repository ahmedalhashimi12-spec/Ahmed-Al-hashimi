import React, { useState, useEffect } from "react";

interface SoapTilesProps {
  scrollProgress: number; // 0 to 3.5
}

const clamp01 = (val: number) => Math.max(0, Math.min(1, val));

interface TileItem {
  label: string;
  baseXOffset: number;
}

const TILES: TileItem[] = [
  { label: "تلميذ ألبرت أينشتاين وحامل إرثه العلمي", baseXOffset: 120 },
  { label: "ثاني رئيس في تاريخ جامعة بغداد العتيدة", baseXOffset: 180 },
  { label: "رائد فيزياء الأعاصير وديناميكيات الغلاف الجوي", baseXOffset: 240 },
];

export default function SoapTiles({ scrollProgress }: SoapTilesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isVisible = scrollProgress > 0.75;
  const easeProgress = clamp01((scrollProgress - 0.75) / 0.22);

  return (
    <div
      dir="ltr"
      className={`absolute left-4 md:left-[64px] right-auto top-[38%] md:top-1/2 -translate-y-1/2 flex flex-col items-start gap-2 md:gap-[10px] z-40 transition-all duration-[800ms] ease-out ${
        isVisible
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 -translate-x-6 md:-translate-x-12 pointer-events-none"
      }`}
    >
      {TILES.map((tile, idx) => {
        const responsiveOffset = isMobile ? tile.baseXOffset * 0.25 : tile.baseXOffset;
        const translateX = (easeProgress - 1) * responsiveOffset;
        const opacity = easeProgress;
        const blurAmount = (1 - easeProgress) * 12;

        // Hover offset calculation (desktop only)
        let translateY = 0;
        let scale = 1.0;

        if (!isMobile && hoveredIndex !== null) {
          if (hoveredIndex === idx) {
            scale = 1.2;
          } else {
            // neighboring items shift up/down
            translateY = idx < hoveredIndex ? -13.8 : 13.8;
          }
        }

        return (
          <div
            key={idx}
            onMouseEnter={() => !isMobile && setHoveredIndex(idx)}
            onMouseLeave={() => !isMobile && setHoveredIndex(null)}
            className="group relative h-[52px] sm:h-[72px] md:h-[138px] text-white bg-white/[0.05] backdrop-blur-[24px] border border-white/[0.12] rounded-xl sm:rounded-2xl md:rounded-[34px] flex items-center justify-center px-4 sm:px-8 md:px-14 w-full md:w-auto md:self-start cursor-pointer origin-left transition-all duration-[400ms] cubic-bezier(0.16, 1, 0.3, 1) whitespace-nowrap select-none hover:bg-white/[0.12] hover:border-white/[0.22] hover:shadow-[0_25px_60px_rgba(255,0,94,0.15)]"
            style={{
              transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
              opacity,
              filter: blurAmount > 0.1 ? `blur(${blurAmount}px)` : "none",
              willChange: "transform, opacity, filter",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 12px 36px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span
              className="font-manrope font-bold text-[11px] sm:text-[14px] md:text-[22px] leading-[14px] sm:leading-[22px] md:leading-[34px] text-center md:text-right"
              dir="rtl"
            >
              {tile.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
