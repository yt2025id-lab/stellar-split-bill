"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

interface PinnedOptions {
  /** Scroll distance the section stays pinned, in % of viewport height. */
  endVh?: number;
  /** Below this viewport width, don't pin - just show final state (mobile). */
  disableBelow?: number;
}

/**
 * Pin a section and expose scroll `progress` (0→1) while it's held.
 * On mobile / reduced motion it skips pinning and reports progress = 1
 * (final state), so content is never trapped behind animation.
 */
export function usePinned<T extends HTMLElement = HTMLDivElement>(
  opts: PinnedOptions = {}
) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const disableBelow = opts.disableBelow ?? 768;
      if (prefersReducedMotion() || window.innerWidth < disableBelow) {
        setProgress(1);
        return;
      }

      registerScrollTrigger();
      const endVh = opts.endVh ?? 140;

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: `+=${endVh}%`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => setProgress(self.progress),
      });

      return () => st.kill();
    },
    { scope: ref }
  );

  return { ref, progress };
}
