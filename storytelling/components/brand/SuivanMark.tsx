"use client";

import { useId } from "react";

/**
 * The Split Bill brand mark - a teal water droplet with a friendly smile, taken
 * from the dApp's `stellar-icon.svg`. Inlined so it stays crisp and can be
 * placed anywhere; the gradient id is unique per instance (useId) so multiple
 * marks on one page don't collide.
 */
export function SuivanMark({
  className,
  withPlate = false,
}: {
  className?: string;
  withPlate?: boolean;
}) {
  const id = useId();
  const gid = `split-grad-${id}`;
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="Split Bill">
      {withPlate && <rect width="512" height="512" rx="128" fill="#05111F" />}
      <path
        d="M256 72C304 140 376 203 376 294C376 363 322 416 256 416C190 416 136 363 136 294C136 203 208 140 256 72Z"
        fill={`url(#${gid})`}
      />
      <path
        d="M189 299C215 329 295 329 323 299"
        stroke="#F7F0DF"
        strokeWidth="28"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M207 250H305" stroke="#05111F" strokeWidth="24" strokeLinecap="round" />
      <defs>
        <linearGradient id={gid} x1="136" y1="92" x2="389" y2="401" gradientUnits="userSpaceOnUse">
          <stop stopColor="#61D7FF" />
          <stop offset="0.52" stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
    </svg>
  );
}
