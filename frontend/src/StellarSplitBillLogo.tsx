export default function StellarSplitBillLogo({ className, size = 42, logoSize }: { className?: string; size?: number; logoSize?: number }) {
  const imgSize = logoSize ?? size;
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src="/logoStellar.png"
        alt="Stellar"
        width={imgSize}
        height={imgSize}
        style={{ width: imgSize, height: imgSize, display: "block" }}
      />
      <span style={{
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontSize: size * 0.52,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        color: "var(--text-primary, #1a1a1a)",
      }}>
        Split Bill
      </span>
    </div>
  );
}
