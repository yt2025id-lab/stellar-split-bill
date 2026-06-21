"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

interface BoldRevealOptions {
  /** Pin (lock) the section in place for a short hold so it can be read fully. */
  pin?: boolean;
  /** Hold distance while pinned, in % of viewport height. */
  pinVh?: number;
}

/**
 * Bold, scroll-driven choreography for a whole section. Mark descendants:
 *  - [data-split]    → headline split into masked lines, wiped up line-by-line
 *  - [data-reveal]   → fade + rise
 *  - [data-card]     → enters from below, rotating in (alternating L/R) + scaling
 *  - [data-parallax] → drifts vertically through the section (value = px)
 *  - [data-float]    → continuous gentle float (decorative)
 * With `{ pin: true }` the section also locks in place for a hold (desktop only).
 * Everything is shown instantly under reduced motion.
 */
export function useBoldReveal<T extends HTMLElement = HTMLDivElement>(
  opts: BoldRevealOptions = {}
) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const splits = el.querySelectorAll<HTMLElement>("[data-split]");
      const reveals = el.querySelectorAll<HTMLElement>("[data-reveal]");
      const cards = el.querySelectorAll<HTMLElement>("[data-card]");
      const parallax = el.querySelectorAll<HTMLElement>("[data-parallax]");
      const floats = el.querySelectorAll<HTMLElement>("[data-float]");
      const draws = el.querySelectorAll<SVGGeometryElement>("[data-draw]");

      if (prefersReducedMotion()) {
        gsap.set([...splits, ...reveals, ...cards], { autoAlpha: 1 });
        gsap.set(draws, { strokeDasharray: "none", strokeDashoffset: 0 });
        return;
      }

      registerScrollTrigger();

      splits.forEach((node) => {
        const split = new SplitType(node, { types: "lines", lineClass: "split-line" });
        gsap.set(node, { autoAlpha: 1 });
        const inners = (split.lines ?? []).map((line) => {
          const inner = document.createElement("span");
          inner.innerHTML = line.innerHTML;
          line.innerHTML = "";
          line.appendChild(inner);
          return inner;
        });
        gsap.from(inners, {
          yPercent: 120,
          duration: 1,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: { trigger: node, start: "top 85%" },
        });
      });

      reveals.forEach((node) => {
        gsap.from(node, {
          autoAlpha: 0,
          y: 44,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: node, start: "top 88%" },
        });
      });

      cards.forEach((node, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.from(node, {
          autoAlpha: 0,
          yPercent: 60,
          rotation: dir * 14,
          scale: 0.82,
          transformOrigin: "center bottom",
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: node, start: "top 90%" },
        });
      });

      parallax.forEach((node) => {
        const dist = parseFloat(node.dataset.parallax ?? "80");
        gsap.fromTo(
          node,
          { y: -dist },
          {
            y: dist,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      floats.forEach((node, i) => {
        gsap.to(node, {
          y: gsap.utils.random(-24, 24),
          x: gsap.utils.random(-18, 18),
          rotation: gsap.utils.random(-8, 8),
          duration: 4 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // SVG line graphics that "draw" themselves as the section scrolls in.
      draws.forEach((node) => {
        if (typeof node.getTotalLength !== "function") return;
        const len = node.getTotalLength();
        if (!len) return;
        gsap.set(node, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(node, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "center center",
            scrub: true,
          },
        });
      });

      // Lock the section in place for a hold so it can be read fully (desktop).
      if (opts.pin && window.innerWidth >= 768) {
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: `+=${opts.pinVh ?? 70}%`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        });
      }
    },
    { scope: ref }
  );

  return ref;
}
