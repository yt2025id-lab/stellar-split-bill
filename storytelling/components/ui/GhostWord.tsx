/**
 * A giant outlined "ghost" word sitting behind a section's content - like the
 * red TRUST on The Crack. Convey the section's meaning; colour it with the
 * section accent (pass an rgba stroke). Position via `className` (absolute).
 */
export function GhostWord({
  text,
  stroke,
  className = "",
}: {
  text: string;
  stroke: string;
  className?: string;
}) {
  return (
    <span
      className={`font-display pointer-events-none absolute select-none leading-none ${className}`}
      style={{ color: "transparent", WebkitTextStroke: `2px ${stroke}` }}
      aria-hidden
    >
      {text}
    </span>
  );
}
