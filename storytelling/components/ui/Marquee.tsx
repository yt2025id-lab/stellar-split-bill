"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/**
 * Continuously scrolling keyword ticker. Base drift runs always; scroll
 * velocity speeds it up and skews it slightly for a reactive, alive feel.
 * Under reduced motion it renders as a static row.
 */
export function Marquee({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || prefersReducedMotion()) return;
      registerScrollTrigger();

      const half = track.scrollWidth / 2;
      const loop = gsap.to(track, {
        x: -half,
        duration: 22,
        ease: "none",
        repeat: -1,
      });

      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          const boost = gsap.utils.clamp(1, 7, 1 + Math.abs(v) / 280);
          loop.timeScale(boost);
          gsap.to(track, {
            skewX: gsap.utils.clamp(-6, 6, v / 320),
            duration: 0.35,
            overwrite: "auto",
          });
        },
      });

      return () => {
        loop.kill();
        st.kill();
      };
    },
    { scope: trackRef }
  );

  // Duplicate the list so the -50% loop is seamless.
  const row = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden border-y-[3px] py-3"
      style={{ background: "var(--color-sui)", borderColor: "var(--color-text)" }}
    >
      <div ref={trackRef} className="flex w-max gap-8 whitespace-nowrap will-change-transform">
        {row.map((item, i) => (
          <span
            key={i}
            className="font-display flex items-center gap-8 text-2xl tracking-wide"
            style={{ color: "var(--color-ink)" }}
          >
            <span>{item}</span>
            <span aria-hidden>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
