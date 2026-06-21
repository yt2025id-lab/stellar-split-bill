import type { CSSProperties } from "react";

/** Linear 0→1 ramp of `p` between `a` and `b`. */
export function ramp(p: number, a: number, b: number): number {
  if (b === a) return p >= b ? 1 : 0;
  return Math.max(0, Math.min(1, (p - a) / (b - a)));
}

/** Smoothstep easing of a 0→1 value. */
export function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Progress-driven entrance style: fades + slides an element in as scroll
 * progress `p` passes from `a` to `b`. `fromX`/`fromY` are the starting offset
 * in px (element settles to 0,0). Use inside a pinned section so content reveals
 * sequentially while the section is locked.
 */
export function revealItem(
  p: number,
  a: number,
  b: number,
  fromX = 0,
  fromY = 24
): CSSProperties {
  const t = ramp(p, a, b);
  return {
    opacity: t,
    transform: `translate(${fromX * (1 - t)}px, ${fromY * (1 - t)}px)`,
  };
}
