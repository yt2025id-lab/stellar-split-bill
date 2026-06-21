import Image from "next/image";

/** The Split Bill emblem (community circle + wordmark), from stellar-logo.png. */
export function SuivanLogo({
  size = 40,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
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
