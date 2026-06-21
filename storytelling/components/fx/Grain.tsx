"use client";

/**
 * Fixed structural grid texture. Brutalism stays flat and hard-edged, so the
 * earlier animated film grain is dropped - just a faint grid for depth.
 * Purely decorative, non-interactive.
 */
export function Grain() {
  return <div className="fx-grid" aria-hidden />;
}
