"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Move } from "lucide-react";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/**
 * Tilted yellow ecosystem ticker used as a brutalist divider between scenes.
 * A base GSAP loop always runs; scroll velocity speeds it up and skews it, so it
 * is alive even when idle and reacts when you scroll. Static under reduced motion.
 */
export function StripeMarquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || prefersReducedMotion()) return;
      registerScrollTrigger();

      const half = track.scrollWidth / 2;
      const loop = gsap.to(track, { x: -half, duration: 26, ease: "none", repeat: -1 });

      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          loop.timeScale(gsap.utils.clamp(1, 7, 1 + Math.abs(v) / 280));
          gsap.to(track, { skewX: gsap.utils.clamp(-5, 5, v / 360), duration: 0.35, overwrite: "auto" });
        },
      });

      return () => {
        loop.kill();
        st.kill();
      };
    },
    { scope: trackRef }
  );

  const row = [...items, ...items];

  return (
    <div className={`relative z-[3] w-[112%] -ml-[6%] ${className}`}>
      <div className="overflow-hidden border-y-[8px] border-[var(--color-text)] bg-[#f0c040] py-3 shadow-[0_10px_0_-2px_rgba(10,10,10,0.25)] md:py-5">
        <div ref={trackRef} className="flex w-max items-center will-change-transform">
          {row.map((word, i) => (
            <div key={i} className="flex items-center gap-8 pr-8">
              <span className="font-display whitespace-nowrap text-3xl tracking-[-0.03em] text-[var(--color-text)] md:text-6xl">
                {word}
              </span>
              <Move className="h-9 w-9 rotate-45 text-[var(--color-text)] md:h-14 md:w-14" strokeWidth={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
