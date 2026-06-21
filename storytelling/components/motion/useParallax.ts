"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/**
 * Parallax drift for decorative layers. Children marked `[data-parallax]`
 * move vertically as the container scrolls through view; the strength is read
 * from the element's `data-parallax` value (px, can be negative). No-op under
 * reduced motion.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      registerScrollTrigger();

      el.querySelectorAll<HTMLElement>("[data-parallax]").forEach((node) => {
        const dist = parseFloat(node.dataset.parallax ?? "0");
        gsap.to(node, {
          y: dist,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: ref }
  );

  return ref;
}
