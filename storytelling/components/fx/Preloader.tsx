"use client";

import { useState } from "react";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { SplitBillLogo } from "@/components/brand/SplitBillLogo";

/**
 * Short cinematic intro: the wordmark wipes up behind a mask, holds briefly,
 * then the whole curtain slides away to reveal the page. Removes itself from
 * the DOM when done. Under reduced motion it never shows.
 */
export function Preloader() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        setDone(true);
        return;
      }
      const tl = gsap.timeline({ onComplete: () => setDone(true) });
      tl.from(".pre-mark", {
        scale: 0.4,
        autoAlpha: 0,
        rotate: -12,
        duration: 0.7,
        ease: "back.out(1.7)",
      })
        .from(
          ".pre-word > span",
          { yPercent: 110, duration: 0.7, ease: "power4.out", stagger: 0.08 },
          "-=0.35"
        )
        .to(".pre-line", { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.3")
        .to(".pre-mark, .pre-word, .pre-line", { autoAlpha: 0, duration: 0.3 }, "+=0.2")
        .to(root.current, {
          yPercent: -100,
          duration: 0.7,
          ease: "power4.inOut",
        });
    },
    { scope: root }
  );

  if (done) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--color-base)]"
      aria-hidden
    >
      <SplitBillLogo size={120} priority className="pre-mark h-28 w-28" />
      <div className="pre-word font-display mt-5 overflow-hidden text-3xl tracking-[0.3em]">
        <span className="inline-block">Split Protocol</span>
      </div>
      <div className="pre-line mt-4 h-1 w-40 origin-left scale-x-0 bg-[var(--color-stellar)]" />
    </div>
  );
}
