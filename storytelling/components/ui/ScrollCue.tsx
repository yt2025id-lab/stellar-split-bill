export function ScrollCue({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-[var(--color-muted)]">
      <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
      <span aria-hidden className="h-8 w-px animate-pulse bg-[var(--color-muted)]" />
    </div>
  );
}
