"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A premium dot + lagging ring cursor, katana-style. Only mounts on
 * fine-pointer (mouse) devices and when motion is allowed. The ring grows
 * over interactive elements ([data-cursor], a, button).
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const moveDot = gsap.quickSetter(dot, "css");
    const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      moveDot({ x: e.clientX, y: e.clientY });
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const grow = () =>
      gsap.to(ring, { scale: 1.7, borderColor: "rgba(111,43,255,0.9)", duration: 0.2 });
    const shrink = () =>
      gsap.to(ring, { scale: 1, borderColor: "rgba(250,250,250,0.4)", duration: 0.2 });

    const interactive = "a, button, [data-cursor]";
    const onOver = (e: Event) => {
      if ((e.target as HTMLElement).closest(interactive)) grow();
    };
    const onOut = (e: Event) => {
      if ((e.target as HTMLElement).closest(interactive)) shrink();
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}
