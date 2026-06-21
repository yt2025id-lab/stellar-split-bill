import Image from "next/image";

/** Split Bill brand mark — Stellar logo with optional wordmark. */
export function SplitBillLogo({
  size = 28,
  priority = false,
  className = "",
}: {
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="/stellar-logo.png"
      alt="Split Bill"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
