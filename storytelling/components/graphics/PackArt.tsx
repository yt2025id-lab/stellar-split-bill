"use client";

import type { ReactNode } from "react";

/**
 * Inlined, background-stripped versions of the brutalist SVG art pack
 * (stellar-assets-svg-pack). The opaque #0D0D0D background + grid/halftone
 * fills were removed so the art floats transparently over our sections.
 * Stroked outline paths are tagged `data-art-draw` so <ReactiveArt> can draw
 * them on scroll; orbiting accent groups use `.spin-slow`.
 */

type Props = { className?: string };

function Svg({ className, children }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 800 800"
      className={className}
      style={{ color: "var(--color-text)" }}
      role="img"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function SpotAkar({ className }: Props) {
  return (
    <Svg className={className}>
      <circle data-art-draw cx="400" cy="400" r="245" fill="none" stroke="currentColor" strokeWidth="9" />
      <circle cx="400" cy="400" r="90" fill="#FFD000" stroke="currentColor" strokeWidth="9" />
      <path d="M365 395h70M400 360v80" stroke="#0D0D0D" strokeWidth="16" />
      <g className="spin-slow" fill="#38BDF8" stroke="currentColor" strokeWidth="8">
        <path d="M392 105h62l30 105h-92z" />
        <path d="M610 260l46 46-54 96-66-66z" />
        <path d="M565 585l-44 44-100-48 65-68z" />
        <path d="M210 550l-45-45 45-98 70 63z" />
        <path d="M185 215l62-18 72 74-84 32z" />
      </g>
    </Svg>
  );
}

export function SpotRetakan({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M400 95l235 88v170c0 165-99 278-235 352-136-74-235-187-235-352V183z"
        fill="#E8180A"
        stroke="currentColor"
        strokeWidth="10"
      />
      <path
        data-art-draw
        d="M410 145l-45 155 85 38-95 130 70 50-42 144"
        fill="none"
        stroke="#0D0D0D"
        strokeWidth="22"
        strokeLinejoin="miter"
      />
      <circle cx="505" cy="335" r="58" fill="#0D0D0D" stroke="currentColor" strokeWidth="8" />
      <path d="M440 500c20-72 112-72 132 0z" fill="#0D0D0D" stroke="currentColor" strokeWidth="8" />
      <path data-art-draw d="M560 430l120 30-42 52" fill="none" stroke="currentColor" strokeWidth="8" />
    </Svg>
  );
}

export function SpotTempaan({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        data-art-draw
        d="M255 360V260c0-88 58-150 145-150s145 62 145 150v100"
        fill="none"
        stroke="currentColor"
        strokeWidth="22"
      />
      <rect x="205" y="330" width="390" height="290" fill="#00E060" stroke="currentColor" strokeWidth="10" />
      <circle cx="400" cy="465" r="48" fill="#0D0D0D" stroke="currentColor" strokeWidth="8" />
      <path d="M400 512v62" stroke="currentColor" strokeWidth="18" />
      <path d="M170 674h460l-60 60H230z" fill="#FFD000" stroke="currentColor" strokeWidth="8" />
      <path data-art-draw d="M640 205a265 265 0 0 1 25 330" fill="none" stroke="#00E060" strokeWidth="22" />
      <circle cx="652" cy="205" r="22" fill="#00E060" stroke="currentColor" strokeWidth="6" />
    </Svg>
  );
}

export function SpotNyala({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        data-art-draw
        d="M155 245h190c75 0 100 80 155 145l80 95"
        fill="none"
        stroke="currentColor"
        strokeWidth="36"
        strokeLinecap="square"
      />
      <path
        data-art-draw
        d="M155 555h190c75 0 100-80 155-145l80-95"
        fill="none"
        stroke="currentColor"
        strokeWidth="36"
        strokeLinecap="square"
      />
      <path data-art-draw d="M520 400h150" stroke="#00E060" strokeWidth="70" strokeLinecap="square" />
      <path
        data-art-draw
        d="M645 290l115 110-115 110"
        fill="none"
        stroke="#00E060"
        strokeWidth="70"
        strokeLinejoin="miter"
      />
      <g fill="#FFD000" stroke="currentColor" strokeWidth="6">
        <path d="M300 135l25 55 60 8-45 40 12 58-52-30-52 30 12-58-45-40 60-8z" />
        <path d="M265 625l18 42 45 6-34 30 9 44-38-23-39 23 9-44-34-30 45-6z" />
      </g>
    </Svg>
  );
}

export function SpotSistem({ className }: Props) {
  return (
    <Svg className={className}>
      <rect x="180" y="190" width="440" height="420" fill="#38BDF8" stroke="currentColor" strokeWidth="10" />
      <path d="M180 290h440" stroke="currentColor" strokeWidth="10" />
      <path d="M270 130v110M530 130v110" stroke="currentColor" strokeWidth="22" />
      <circle cx="400" cy="455" r="118" fill="#0D0D0D" stroke="currentColor" strokeWidth="10" />
      <path data-art-draw d="M400 455V365M400 455h75" stroke="currentColor" strokeWidth="12" fill="none" />
      <g fill="#FFD000" stroke="currentColor" strokeWidth="7">
        <circle cx="275" cy="350" r="30" />
        <circle cx="400" cy="350" r="30" />
        <circle cx="525" cy="350" r="30" />
      </g>
      <g data-art-draw stroke="currentColor" strokeWidth="8" fill="none">
        <path d="M140 400h60M600 400h60M400 105v60M400 635v60" />
      </g>
    </Svg>
  );
}

export function SpotBukti({ className }: Props) {
  return (
    <Svg className={className}>
      <path d="M245 190h310l-40 210H285z" fill="#00E060" stroke="currentColor" strokeWidth="10" />
      <rect x="190" y="395" width="420" height="135" fill="#FFD000" stroke="currentColor" strokeWidth="10" />
      <circle cx="400" cy="590" r="115" fill="#0D0D0D" stroke="currentColor" strokeWidth="10" />
      <circle data-art-draw cx="400" cy="590" r="82" fill="none" stroke="currentColor" strokeWidth="8" />
      <path
        data-art-draw
        d="M350 590l35 35 75-85"
        fill="none"
        stroke="#0D0D0D"
        strokeWidth="24"
        strokeLinejoin="miter"
      />
      <path d="M300 150h200v78H300z" fill="#E8180A" stroke="currentColor" strokeWidth="10" />
    </Svg>
  );
}

/** Feature icons (full pack art) for the gallery cards. */
export function FeatureArt({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "zkLogin":
      return (
        <Svg className={className}>
          <g fill="#38BDF8" stroke="currentColor" strokeWidth="10" strokeLinejoin="miter">
            <path d="M250 410a110 110 0 1 0 220 0 110 110 0 0 0-220 0z" />
            <circle cx="330" cy="390" r="14" fill="#0D0D0D" />
            <circle cx="430" cy="390" r="14" fill="#0D0D0D" />
            <path d="M330 455c35 35 105 35 140 0" fill="none" stroke="#0D0D0D" strokeWidth="14" />
            <path d="M475 320l115-115 45 45-36 36 32 32-38 38-32-32-45 45z" />
          </g>
        </Svg>
      );
    case "Sponsored Tx":
      return (
        <Svg className={className}>
          <g fill="#FFD000" stroke="currentColor" strokeWidth="10" strokeLinejoin="miter">
            <path d="M245 180h230v500H245z" />
            <path d="M305 245h110v120H305z" fill="#0D0D0D" stroke="currentColor" strokeWidth="8" />
            <path d="M475 300h70l45 65v190c0 45 65 45 65 0V360" fill="none" stroke="currentColor" strokeWidth="18" />
            <circle cx="360" cy="520" r="78" fill="#0D0D0D" stroke="currentColor" strokeWidth="8" />
          </g>
        </Svg>
      );
    case "DeepBook V3":
      return (
        <Svg className={className}>
          <g fill="#00E060" stroke="currentColor" strokeWidth="10" strokeLinejoin="miter">
            <rect x="180" y="180" width="440" height="440" />
            <path d="M255 505h75V355h-75zM365 505h75V270h-75zM475 505h75V410h-75z" fill="#0D0D0D" stroke="currentColor" strokeWidth="8" />
            <path d="M245 295l90-80 90 60 120-110" fill="none" stroke="currentColor" strokeWidth="18" />
          </g>
        </Svg>
      );
    case "Seal":
      return (
        <Svg className={className}>
          <g fill="#8B5CF6" stroke="currentColor" strokeWidth="10" strokeLinejoin="miter">
            <rect x="225" y="330" width="350" height="285" />
            <path d="M285 330V235c0-70 48-120 115-120s115 50 115 120v95" fill="none" stroke="currentColor" strokeWidth="20" />
            <path d="M300 405h200M300 475h200M300 545h200M335 380v190M400 380v190M465 380v190" stroke="#0D0D0D" strokeWidth="12" />
          </g>
        </Svg>
      );
    case "Walrus":
      return (
        <Svg className={className}>
          <g fill="#38BDF8" stroke="currentColor" strokeWidth="10" strokeLinejoin="miter">
            <ellipse cx="400" cy="260" rx="210" ry="75" />
            <path d="M190 260v260c0 42 94 75 210 75s210-33 210-75V260" />
            <path d="M190 390c0 42 94 75 210 75s210-33 210-75" fill="none" stroke="currentColor" strokeWidth="9" />
            <path d="M190 520c0 42 94 75 210 75s210-33 210-75" fill="none" stroke="currentColor" strokeWidth="9" />
          </g>
        </Svg>
      );
    default:
      return null;
  }
}
