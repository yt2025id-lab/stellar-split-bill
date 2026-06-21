"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/**
 * Lenis smooth scroll wired into the GSAP ticker so ScrollTrigger timelines
 * (scrubbed reveals, pinned sections, the velocity marquee) all stay in sync
 * with the eased scroll position. Disabled under reduced motion (native scroll).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Always start at the top on (re)load instead of restoring scroll position.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    if (prefersReducedMotion()) return;
    registerScrollTrigger();

    const lenis = new Lenis({ duration: 1.15 });
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
