"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/**
 * Wraps a piece of pack art and makes it scroll-reactive on its own:
 *  - the whole art drifts vertically (parallax) through the section
 *  - any inner `[data-art-draw]` stroke path "draws" itself across the scroll
 * Uses a dedicated `data-art-draw` attribute (not `data-draw`) so it never
 * collides with a section's own useBoldReveal choreography.
 */
export function ReactiveArt({
  children,
  className,
  parallax = 90,
}: {
  children: ReactNode;
  className?: string;
  parallax?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const draws = el.querySelectorAll<SVGGeometryElement>("[data-art-draw]");

      if (prefersReducedMotion()) {
        gsap.set(draws, { strokeDasharray: "none", strokeDashoffset: 0 });
        return;
      }

      registerScrollTrigger();

      gsap.fromTo(
        el,
        { y: -parallax / 2 },
        {
          y: parallax / 2,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        }
      );

      draws.forEach((node) => {
        if (typeof node.getTotalLength !== "function") return;
        const len = node.getTotalLength();
        if (!len) return;
        gsap.set(node, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(node, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 85%", end: "center center", scrub: true },
        });
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className} aria-hidden>
      {children}
    </div>
  );
}
