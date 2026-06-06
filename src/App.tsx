import React, { useEffect, useRef, useState } from "react";
import VideoScrubber from "./components/VideoScrubber";
import SecondVideoScrubber from "./components/SecondVideoScrubber";
import ScrollExitSplitText from "./components/ScrollExitSplitText";
import SoapTiles from "./components/SoapTiles";
import Header from "./components/Header";
import CylindricalTextDrum from "./components/CylindricalTextDrum";
import Marquee from "./components/Marquee";
import { GoogleWordmark, GithubWordmark } from "./components/Logos";
import { NavigationItem } from "./types";

const clamp01 = (val: number) => Math.max(0, Math.min(1, val));

export default function App() {
  const [scrollProgress, setScrollProgressState] = useState(0);
  const [lerpedScrollProgress, setLerpedScrollProgress] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState("hero");

  const scrollProgressRef = useRef(0);
  const lastTouchYRef = useRef(0);

  // Programmatic navigation tracking
  const isNavigatingRef = useRef(false);
  const navigateStartRef = useRef(0);
  const navigateTargetRef = useRef(0);
  const navigateTimeRef = useRef<number | null>(null);

  const setScrollProgress = (val: number) => {
    const clamped = Math.max(0, Math.min(3.5, val));
    scrollProgressRef.current = clamped;
    setScrollProgressState(clamped);
  };

  const updateActiveSection = (progress: number) => {
    if (progress < 0.40) return "hero";
    if (progress >= 0.40 && progress < 1.15) return "legacy";
    if (progress >= 1.15 && progress < 3.20) return "biography";
    return "about";
  };

  // Programmatic transition trigger
  const handleNavigateToSection = (item: NavigationItem | { id: string; label: string; scrollRatio: number }) => {
    isNavigatingRef.current = true;
    navigateStartRef.current = scrollProgressRef.current;
    navigateTargetRef.current = item.scrollRatio;
    navigateTimeRef.current = performance.now();
  };

  // Gesture listeners to drive scrollProgress
  useEffect(() => {
    // Lock scroll roots
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Any manual action cancels programmatic scroll
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
      }
      const scaleFactor = 0.0006;
      setScrollProgress(scrollProgressRef.current + e.deltaY * scaleFactor);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastTouchYRef.current = e.touches[0].clientY;
      }
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent standard bounce
      if (e.cancelable) {
        e.preventDefault();
      }
      if (e.touches.length > 0) {
        const currentTouchY = e.touches[0].clientY;
        const deltaTouchY = lastTouchYRef.current - currentTouchY;
        const scaleFactor = 0.0015;
        setScrollProgress(scrollProgressRef.current + deltaTouchY * scaleFactor);
        lastTouchYRef.current = currentTouchY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Frame tick loop for smooth programmatic transitions and lerping
  useEffect(() => {
    let animId: number;

    const tick = () => {
      // Step 1: Programmatic navigation easing if active
      if (isNavigatingRef.current && navigateTimeRef.current !== null) {
        const now = performance.now();
        const elapsed = now - navigateTimeRef.current;
        const p = Math.min(elapsed / 1200, 1);
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const nextVal = navigateStartRef.current + (navigateTargetRef.current - navigateStartRef.current) * ease;
        setScrollProgress(nextVal);

        if (p >= 1) {
          isNavigatingRef.current = false;
        }
      }

      // Step 2: Smooth values update with lerping
      setLerpedScrollProgress((prev) => {
        const diff = scrollProgressRef.current - prev;
        if (Math.abs(diff) < 0.0001) {
          return scrollProgressRef.current;
        }
        return prev + diff * 0.08;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update visual active sections on lerped update
  useEffect(() => {
    setActiveSectionId(updateActiveSection(scrollProgress));
  }, [scrollProgress]);

  // Second screen activation math
  const secondScreenProgress = clamp01((lerpedScrollProgress - 1.15) / 0.5);
  const easedRisingProgress = 1 - Math.pow(1 - secondScreenProgress, 3);
  const smoothBlurAmount = Math.sin((secondScreenProgress * Math.PI) / 2) * 64;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#FF005E] text-white">
      <div className="relative w-full h-full overflow-hidden">
        {/* FIRST SCREEN — gets blurred as second screen rises */}
        <div
          className="absolute inset-0 w-full h-full z-10"
          style={{
            filter: secondScreenProgress > 0 ? `blur(${smoothBlurAmount}px)` : "none",
            transform: "translate3d(0, 0, 0)",
            willChange: "filter, transform",
          }}
        >
          <VideoScrubber scrollProgress={Math.min(1, lerpedScrollProgress)} />

          {/* Hero title strip pinned to bottom */}
          <div className="absolute bottom-[40px] left-[1%] right-[1%] w-[98%] pointer-events-none z-20 select-none flex justify-center items-center">
            <ScrollExitSplitText
              scrollProgress={Math.min(1, lerpedScrollProgress)}
              containerClassName="w-full text-[8vw] leading-none font-manrope font-extrabold text-white whitespace-nowrap text-center transition-all duration-300 will-change-transform"
            >
              عبد الجبار عبد الله
            </ScrollExitSplitText>
          </div>

          <SoapTiles scrollProgress={lerpedScrollProgress} />
        </div>

        {/* Brand Menu header overlay */}
        <Header activeSectionId={activeSectionId} onNavigate={handleNavigateToSection} />

        {/* SECOND SCREEN — rises from below, rounded top */}
        <div
          className="absolute bottom-0 left-0 w-full h-full bg-[#11010a] rounded-t-[48px] border-t border-white/10 overflow-hidden z-40 shadow-[0_-20px_100px_rgba(0,0,0,0.8)]"
          style={{
            transform: `translateY(${(1 - easedRisingProgress) * 100}%)`,
            visibility: secondScreenProgress > 0 ? "visible" : "hidden",
            willChange: "transform",
          }}
        >
          {/* iOS Grab Handle */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-[5px] bg-white/20 rounded-full z-50 pointer-events-none" />

          {/* Background Scrubber Glow Simulation */}
          <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-[#ea1f63] to-transparent pointer-events-none z-10" />

          <SecondVideoScrubber scrollProgress={lerpedScrollProgress} />

          <CylindricalTextDrum scrollProgress={lerpedScrollProgress} />

          {/* Bottom aligned marquee brand stream */}
          <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-0 w-full sm:w-[65%] md:w-[60%] pl-6 sm:pl-12 md:pl-20 pr-6 sm:pr-12 md:pr-16 z-50 pointer-events-auto">
            <div className="w-full border-t border-white/[0.08] pt-6">
              <Marquee gap="80px" speed={20} fade>
                <div className="flex items-center shrink-0 font-manrope">
                  <span className="text-[11px] sm:text-[13px] text-white/50 hover:text-[#FF005E] transition-colors cursor-default select-none font-semibold">
                    معهد ماساتشوستس للتكنولوجيا (MIT)
                  </span>
                </div>
                <div className="flex items-center shrink-0 font-manrope">
                  <span className="text-[11px] sm:text-[13px] text-white/50 hover:text-[#FF005E] transition-colors cursor-default select-none font-semibold">
                    جامعة بغداد
                  </span>
                </div>
                <div className="flex items-center shrink-0 font-manrope">
                  <span className="text-[11px] sm:text-[13px] text-white/50 hover:text-[#FF005E] transition-colors cursor-default select-none font-semibold">
                    الجامعة الأمريكية في بيروت (AUB)
                  </span>
                </div>
                <div className="flex items-center shrink-0 font-manrope">
                  <span className="text-[11px] sm:text-[13px] text-white/50 hover:text-[#FF005E] transition-colors cursor-default select-none font-semibold">
                    المركز الوطني لأبحاث الغلاف الجوي (NCAR)
                  </span>
                </div>
                <div className="flex items-center shrink-0 font-manrope">
                  <span className="text-[11px] sm:text-[13px] text-white/50 hover:text-[#FF005E] transition-colors cursor-default select-none font-semibold">
                    جامعة ولاية نيويورك بألباني (SUNY)
                  </span>
                </div>
              </Marquee>
            </div>
          </div>

          {/* LOADING STATE OVERLAY / Corner indicator */}
          <div className="absolute bottom-8 right-12 hidden md:flex flex-col items-end gap-2 z-50 pointer-events-none select-none">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-[#ea1f63] rounded-full animate-pulse" />
              <span className="font-manrope text-[11px] text-[#ea1f63] font-bold">
                مزامنة البيانات: {lerpedScrollProgress.toFixed(2)}p
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
