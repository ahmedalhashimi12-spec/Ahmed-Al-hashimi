import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface ScrollExitSplitTextProps {
  children: string; // "INNER CIRCLE"
  scrollProgress: number; // 0 to 1
  containerClassName?: string;
  style?: React.CSSProperties;
}

export default function ScrollExitSplitText({
  children,
  scrollProgress,
  containerClassName = "",
  style = {},
}: ScrollExitSplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Split text into words then chars
  const words = children.split(" ");

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll(".char");
    if (chars.length === 0) return;

    // Create GSAP Timeline
    const tl = gsap.timeline({ paused: true });

    tl.fromTo(
      chars,
      {
        opacity: 1,
        yPercent: 0,
        y: 0,
        scaleY: 1,
        scaleX: 1,
        transformOrigin: "50% 0%",
      },
      {
        opacity: 0,
        yPercent: 300,
        y: "25vh",
        scaleY: 1.2,
        scaleX: 0.9,
        stagger: 0.03,
        ease: "power2.inOut",
      }
    );

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  // Sync scrollProgress to GSAP Timeline
  useEffect(() => {
    const tl = timelineRef.current;
    if (tl) {
      gsap.to(tl, {
        progress: scrollProgress,
        duration: 0.6,
        ease: "power1.out",
        overwrite: "auto",
      });
    }
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className={`${containerClassName} flex items-center justify-center flex-wrap select-none`}
      style={style}
    >
      {words.map((word, wordIdx) => (
        <React.Fragment key={wordIdx}>
          <span
            className="char inline-block will-change-transform"
            style={{ display: "inline-block" }}
          >
            {word}
          </span>
          {wordIdx < words.length - 1 && (
            <span className="inline-block" aria-hidden="true">
              &nbsp;
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
