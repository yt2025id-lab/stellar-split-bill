"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/**
 * Fade + rise direct children with `[data-reveal]` when the container
 * scrolls into view. No-op (instant visible) under reduced motion.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = el.querySelectorAll("[data-reveal]");
      if (prefersReducedMotion()) {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        return;
      }
      registerScrollTrigger();
      gsap.from(targets, {
        autoAlpha: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: "top 75%" },
      });
    },
    { scope: ref }
  );

  return ref;
}
