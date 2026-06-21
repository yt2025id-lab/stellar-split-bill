"use client";

import { useRef, useState, type ComponentType } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerScrollTrigger, prefersReducedMotion } from "@/lib/motion";

export type SceneComponent = ComponentType<{ active: boolean }>;

// Each scene holds full visibility for HOLD (in segment units) and cross-fades
// over FADE. With both at 0.5 the scenes overlap to a clean 50/50 mid-fade and
// otherwise sit fully visible - so you get time to read each one.
const HOLD = 0.5;
const FADE = 0.5;
// Scroll distance per scene (vh). Higher = slower, more dwell time.
const VH_PER_SCENE = 160;

export function SceneDeck({ scenes }: { scenes: SceneComponent[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [stacked, setStacked] = useState(false);

  useGSAP(
    () => {
      const el = wrapRef.current;
      if (!el) return;
      if (prefersReducedMotion() || window.innerWidth < 768) {
        setStacked(true);
        return;
      }
      registerScrollTrigger();
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setProgress(self.progress),
      });
      return () => st.kill();
    },
    { scope: wrapRef }
  );

  const n = scenes.length;

  if (stacked) {
    return (
      <>
        {scenes.map((Scene, i) => (
          <div key={i} className="relative flex min-h-screen items-center justify-center px-6">
            <Scene active />
          </div>
        ))}
      </>
    );
  }

  const u = progress * n; // 0 → n
  const activeIndex = Math.min(n - 1, Math.max(0, Math.floor(u >= n ? n - 1 : u)));

  return (
    <div ref={wrapRef} style={{ height: `${n * VH_PER_SCENE}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        {scenes.map((Scene, i) => {
          const center = i + 0.5;
          let d = Math.abs(u - center);
          // First scene stays fully visible before its center (clear on load, no
          // scroll needed); last scene stays fully visible after its center.
          if (i === 0 && u < center) d = 0;
          if (i === n - 1 && u > center) d = 0;
          const opacity = Math.max(0, Math.min(1, 1 - Math.max(0, d - HOLD / 2) / FADE));
          const scale = 0.97 + 0.03 * opacity;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                opacity,
                transform: `scale(${scale})`,
                pointerEvents: opacity > 0.6 ? "auto" : "none",
                visibility: opacity <= 0.01 ? "hidden" : "visible",
              }}
            >
              <Scene active={i === activeIndex} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
