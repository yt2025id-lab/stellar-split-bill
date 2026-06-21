"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/**
 * Pin a section and translate its inner track horizontally as the user scrolls
 * vertically. On mobile / reduced motion it does nothing - the track is laid
 * out as a normal vertical stack via CSS, so content is never trapped.
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLElement>(
  opts: { disableBelow?: number } = {}
) {
  const sectionRef = useRef<T>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const disableBelow = opts.disableBelow ?? 768;
      if (prefersReducedMotion() || window.innerWidth < disableBelow) return;

      registerScrollTrigger();

      const getDistance = () => track.scrollWidth - window.innerWidth;
      if (getDistance() <= 0) return;

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.kill();
      };
    },
    { scope: sectionRef }
  );

  return { sectionRef, trackRef };
}
