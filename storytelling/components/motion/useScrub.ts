"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/**
 * Drive a numeric value from `from`→`to` as the container scrolls through
 * the viewport. Under reduced motion the value is pinned to `to`.
 */
export function useScrub<T extends HTMLElement = HTMLDivElement>(
  from: number,
  to: number
) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(from);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        setValue(to);
        return;
      }
      registerScrollTrigger();
      const obj = { v: from };
      gsap.to(obj, {
        v: to,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
        },
        onUpdate: () => setValue(Math.round(obj.v)),
      });
    },
    { scope: ref }
  );

  return { ref, value };
}
