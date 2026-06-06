import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface VideoScrubberProps {
  scrollProgress: number; // 0 to 1
}

export default function VideoScrubber({ scrollProgress }: VideoScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(4.2);

  // Smooth playhead target Lerp
  const currentPlayTimeRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
      setIsLoaded(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleLoadedMetadata);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleLoadedMetadata);
    };
  }, []);

  // Request Animation Frame loop for smoothing video scrub
  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      const video = videoRef.current;
      if (video && isLoaded) {
        const targetTime = Math.min(scrollProgress * duration, duration);
        // Lerp playhead
        currentPlayTimeRef.current += (targetTime - currentPlayTimeRef.current) * 0.15;

        // Ensure we clamp the seeking values properly inside boundaries
        const finalTime = Math.max(0, Math.min(currentPlayTimeRef.current, duration - 0.05));

        if (!video.seeking && Math.abs(video.currentTime - finalTime) > 0.01) {
          video.currentTime = finalTime;
        }
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      active = false;
    };
  }, [scrollProgress, isLoaded, duration]);

  // Mouse move parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const mx = e.clientX / window.innerWidth - 0.5;
      const my = e.clientY / window.innerHeight - 0.5;

      gsap.to(containerRef.current, {
        x: -mx * 40,
        y: -my * 40,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#FF005E]">
      <div
        ref={containerRef}
        className="w-full h-full will-change-transform"
        style={{ scale: "1.05" }}
      >
        <video
          ref={videoRef}
          src="https://labs.google/fx/api/og-video/shared/7d2ac482-7dc8-4e9e-9bdf-8aa334befad8"
          playsInline
          muted
          preload="auto"
          className="w-full h-full object-cover pointer-events-none select-none"
        />
      </div>

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 w-full h-full bg-[#FF005Ef4] z-50 flex flex-col items-center justify-center gap-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full border border-pink-500/20 animate-ping" />
            <div className="w-10 h-10 rounded-full border-4 border-[#ea1f63]/20 border-t-[#ea1f63] animate-spin" />
          </div>
          <span className="font-manrope font-bold text-[13px] text-pink-500 drop-shadow-[0_0_8px_rgba(234,31,99,0.4)]">
            جاري تحميل البث التفاعلي...
          </span>
        </div>
      )}
    </div>
  );
}
