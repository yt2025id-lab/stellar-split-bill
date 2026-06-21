/**
 * Shared brutalist scene chrome: a faint structural grid plus a few brutalist
 * blocks that drift continuously (always-moving, idle), giving every scene the
 * same active neo-brutalist feel as the hero. Purely decorative + non-blocking;
 * the `drift` animation is disabled under reduced motion (see globals.css).
 */
export function SceneDecor({ accent = "var(--color-stellar)" }: { accent?: string }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10,10,10,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        aria-hidden
        className="drift pointer-events-none absolute left-[5%] top-[18%] hidden h-12 w-12 border-[3px] lg:block"
        style={{ borderColor: accent, background: accent, animationDelay: "0s" }}
      />
      <div
        aria-hidden
        className="drift pointer-events-none absolute right-[7%] bottom-[18%] hidden h-10 w-10 rotate-45 border-[3px] lg:block"
        style={{ borderColor: "var(--color-text)", animationDelay: "-3s" }}
      />
      <div
        aria-hidden
        className="drift pointer-events-none absolute left-[14%] bottom-[24%] hidden h-7 w-7 border-[3px] lg:block"
        style={{ borderColor: "var(--color-amber)", background: "var(--color-amber)", animationDelay: "-6s" }}
      />
      {/* Idle-spinning outlined shapes (always moving, like the hero ring) */}
      <div
        aria-hidden
        className="spin-slow pointer-events-none absolute right-[8%] top-[14%] hidden h-28 w-28 border-[3px] lg:block"
        style={{ borderColor: accent, opacity: 0.3 }}
      />
      <div
        aria-hidden
        className="spin-rev pointer-events-none absolute right-[15%] bottom-[16%] hidden h-14 w-14 border-[3px] lg:block"
        style={{ borderColor: "var(--color-text)", opacity: 0.25 }}
      />
    </>
  );
}
