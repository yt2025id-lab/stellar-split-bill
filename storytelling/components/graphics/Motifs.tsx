"use client";

import type { ReactNode } from "react";

/**
 * Brutalist line-art SVG motifs, generated in code (no external assets).
 * Paths marked `[data-draw]` are picked up by useBoldReveal and "draw"
 * themselves as the section scrolls in. Colour comes from the wrapping
 * element via `currentColor`, so callers set `style={{ color }}`.
 */

type SvgProps = { className?: string; color?: string };

const STROKE = 4;

function Frame({
  className,
  color,
  children,
}: SvgProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      style={{ color: color ?? "currentColor", overflow: "visible" }}
      fill="none"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Akar - the rotating savings circle. */
export function SplitRings(props: SvgProps) {
  const dots = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return {
      x: Math.round(120 + Math.cos(a) * 96),
      y: Math.round(120 + Math.sin(a) * 96),
    };
  });
  return (
    <Frame {...props}>
      <circle data-draw cx="120" cy="120" r="96" stroke="currentColor" strokeWidth={STROKE} />
      <circle data-draw cx="120" cy="120" r="62" stroke="currentColor" strokeWidth={STROKE} />
      <g className="spin-slow">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="8" fill="currentColor" />
        ))}
      </g>
      <circle cx="120" cy="120" r="10" fill="currentColor" />
    </Frame>
  );
}

/** Akar - a clean rotating savings circle: a pot ringed by members. */
export function SplitCircle(props: SvgProps) {
  const members = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return {
      x: Math.round(120 + Math.cos(a) * 92),
      y: Math.round(120 + Math.sin(a) * 92),
      fill: i % 2 === 0 ? "var(--color-stellar)" : "var(--color-teal)",
    };
  });
  return (
    <Frame {...props}>
      <circle cx="120" cy="120" r="92" fill="none" stroke="currentColor" strokeWidth="3" />
      <g className="spin-slow">
        {members.map((m, i) => (
          <circle
            key={i}
            cx={m.x}
            cy={m.y}
            r="12"
            fill={m.fill}
            stroke="currentColor"
            strokeWidth="3"
          />
        ))}
      </g>
      {/* the pot */}
      <circle cx="120" cy="120" r="38" fill="var(--color-amber)" stroke="currentColor" strokeWidth="3" />
      <path d="M104 120 H136" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    </Frame>
  );
}

/** Percikan - a spark / lightning bolt. */
export function Spark(props: SvgProps) {
  return (
    <Frame {...props}>
      <path
        data-draw
        d="M138 24 L92 124 L128 124 L86 216 L160 104 L122 104 Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Frame>
  );
}

/** Retakan - a crack splitting downward. */
export function Crack(props: SvgProps) {
  return (
    <Frame {...props}>
      <path
        data-draw
        d="M120 8 L96 66 L134 108 L92 158 L132 206 L108 234"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Frame>
  );
}

/** Nyala - two streams merging into one. */
export function Streams(props: SvgProps) {
  return (
    <Frame {...props}>
      <path
        data-draw
        d="M16 64 C 86 64, 92 120, 150 120"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path
        data-draw
        d="M16 176 C 86 176, 92 120, 150 120"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path data-draw d="M150 120 L228 120" stroke="currentColor" strokeWidth={STROKE + 3} />
      <circle cx="228" cy="120" r="9" fill="currentColor" />
    </Frame>
  );
}

/** Bukti - a verification seal / stamp. */
export function Seal(props: SvgProps) {
  return (
    <Frame {...props}>
      <circle
        className="spin-rev"
        cx="120"
        cy="120"
        r="98"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeDasharray="14 12"
      />
      <circle data-draw cx="120" cy="120" r="72" stroke="currentColor" strokeWidth={STROKE} />
      <path
        data-draw
        d="M86 122 L112 150 L160 92"
        stroke="currentColor"
        strokeWidth={STROKE + 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

/** Cta - a radiating burst. */
export function Burst(props: SvgProps) {
  const lines = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return {
      x: Math.round(120 + Math.cos(a) * 110),
      y: Math.round(120 + Math.sin(a) * 110),
    };
  });
  return (
    <Frame {...props}>
      <g className="spin-slow">
        {lines.map((l, i) => (
          <line
            key={i}
            data-draw
            x1="120"
            y1="120"
            x2={l.x}
            y2={l.y}
            stroke="currentColor"
            strokeWidth={STROKE - 1}
          />
        ))}
      </g>
    </Frame>
  );
}

/** Small brutalist line icons for the feature gallery. */
export function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const common = {
    viewBox: "0 0 48 48",
    className,
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "zkLogin":
      return (
        <svg {...common}>
          <circle cx="18" cy="18" r="9" />
          <path d="M24 24 L40 40 M34 40 L40 40 L40 34" />
        </svg>
      );
    case "Sponsored Tx":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="15" />
          <path d="M16 32 L32 16" />
          <path d="M24 16 v4 M24 28 v4" />
        </svg>
      );
    case "DeepBook V3":
      return (
        <svg {...common}>
          <path d="M10 38 V24 M20 38 V14 M30 38 V20 M40 38 V10" />
          <path d="M8 38 H42" />
        </svg>
      );
    case "Seal":
      return (
        <svg {...common}>
          <rect x="12" y="22" width="24" height="18" />
          <path d="M17 22 v-5 a7 7 0 0 1 14 0 v5" />
        </svg>
      );
    case "Walrus":
      return (
        <svg {...common}>
          <ellipse cx="24" cy="12" rx="13" ry="5" />
          <path d="M11 12 v12 a13 5 0 0 0 26 0 V12" />
          <path d="M11 24 a13 5 0 0 0 26 0" />
        </svg>
      );
    default:
      return null;
  }
}
