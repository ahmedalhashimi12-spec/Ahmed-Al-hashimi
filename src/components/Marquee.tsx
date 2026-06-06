import React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  gap?: string;
  speed?: number; // duration in seconds
  fade?: boolean;
}

export default function Marquee({
  children,
  gap = "80px",
  speed = 25,
  fade = true,
}: MarqueeProps) {
  return (
    <div className="marquee-container flex" style={{ gap }}>
      <div
        className="marquee-track flex items-center"
        style={{
          animationDuration: `${speed}s`,
          gap,
          paddingRight: gap,
        }}
      >
        {React.Children.map(children, (child) => child)}
      </div>
      <div
        className="marquee-track flex items-center"
        style={{
          animationDuration: `${speed}s`,
          gap,
          paddingRight: gap,
        }}
        aria-hidden="true"
      >
        {React.Children.map(children, (child) => child)}
      </div>
    </div>
  );
}
