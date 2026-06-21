"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import SplitType from "split-type";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/**
 * Cinematic text reveal. Any descendant marked `[data-split]` is split into
 * lines, each line masked, and wiped up line-by-line when it scrolls in.
 * Descendants marked `[data-reveal]` get a simpler fade+rise.
 * Under reduced motion everything is shown instantly.
 */
export function useTextReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const splitNodes = el.querySelectorAll<HTMLElement>("[data-split]");
      const reveals = el.querySelectorAll<HTMLElement>("[data-reveal]");

      if (prefersReducedMotion()) {
        gsap.set([...splitNodes, ...reveals], { autoAlpha: 1, y: 0 });
        return;
      }

      registerScrollTrigger();

      splitNodes.forEach((node) => {
        const split = new SplitType(node, {
          types: "lines",
          lineClass: "split-line",
        });
        gsap.set(node, { autoAlpha: 1 });

        // Wrap each line's content so it can slide within an overflow-hidden line.
        const inners = (split.lines ?? []).map((line) => {
          const inner = document.createElement("span");
          inner.innerHTML = line.innerHTML;
          line.innerHTML = "";
          line.appendChild(inner);
          return inner;
        });

        gsap.from(inners, {
          yPercent: 115,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.12,
          scrollTrigger: { trigger: node, start: "top 82%" },
        });
      });

      if (reveals.length) {
        gsap.from(reveals, {
          autoAlpha: 0,
          y: 26,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 72%" },
        });
      }
    },
    { scope: ref }
  );

  return ref;
}
