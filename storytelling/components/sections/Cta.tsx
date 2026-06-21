"use client";

import { ArrowUpRight, Send, MessageCircle } from "lucide-react";
import { useDict } from "@/lib/i18n/LocaleProvider";
import { useBoldReveal } from "@/components/motion/useBoldReveal";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { Button } from "@/components/ui/Button";
import { GhostWord } from "@/components/ui/GhostWord";
import { SplitBillLogo } from "@/components/brand/SplitBillLogo";
import { DAPP_URL } from "@/components/ui/MiniNav";

const EXPLORER_URL =
  "https://stellar.expert/explorer/testnet/contract/CCRVTPOVHJZ7KLANM2AEPIQPLSDWIDK2M66GJQHFEHJVJPHGDCKQOGJ3";

type IconProps = { className?: string };
const InstagramIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const XIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SOCIALS = [
  { label: "Discord", href: "https://discord.gg/XxxM958bm", Icon: MessageCircle },
  { label: "Telegram", href: "https://stellar.org/discord", Icon: Send },
  { label: "Instagram", href: "https://stellar.org", Icon: InstagramIcon },
  { label: "X / Twitter", href: "https://x.com/StellarOrg", Icon: XIcon },
];
const ECOSYSTEM = [
  { label: "Stellar Network", href: "https://stellar.org" },
  { label: "Walrus", href: "https://walrus.xyz" },
  { label: "zkLogin", href: "https://developers.stellar.org/concepts/cryptography/zklogin" },
];

export function Cta() {
  const dict = useDict();
  const f = dict.landing.footer;
  const ref = useBoldReveal<HTMLElement>();
  const magnet = useMagnetic<HTMLSpanElement>(0.5);

  return (
    <section
      ref={ref}
      id="cta"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-24 sm:px-8"
    >
      <GhostWord text="JOIN" stroke="rgba(12,140,233,0.12)" className="left-1/2 top-[6%] -translate-x-1/2 text-[24vw]" />

      {/* Headline + primary CTA */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 data-split className="font-display max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
          {dict.cta.title}
        </h2>
        <span ref={magnet} data-reveal className="mt-10 inline-block">
          <Button href={DAPP_URL} target="_blank" rel="noopener noreferrer" className="px-8 py-4 text-base">
            {dict.cta.button}
          </Button>
        </span>
      </div>

      {/* Footer block, folded into the final section */}
      <div
        data-reveal
        className="relative z-10 mt-20 w-full max-w-5xl border-[4px] border-[var(--color-text)] bg-[var(--color-text)] p-7 brutal-shadow sm:p-10"
      >
        <div className="grid gap-10 md:grid-cols-[1.3fr_0.8fr_0.8fr]">
          {/* Brand + socials */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <SplitBillLogo size={36} className="h-9 w-9" />
              <div>
                <span className="font-display block text-xl text-[var(--color-surface)]">Split Bill</span>
                <span className="font-display block text-[10px] uppercase tracking-[0.18em] text-[var(--color-stellar)]">{f.tagline}</span>
              </div>
            </div>
            <p className="max-w-xs text-sm font-medium leading-7 text-[#a8a49a]">{f.blurb}</p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  data-cursor
                  className="grid size-9 place-items-center border-[3px] border-[#a8a49a] text-[#a8a49a] transition hover:border-[var(--color-stellar)] hover:bg-[var(--color-stellar)] hover:text-[var(--color-text)]"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-num mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-stellar)]">{f.productTitle}</h4>
            <div className="flex flex-col gap-2.5">
              {f.product.map((label) => (
                <a key={label} href="#" data-cursor className="text-sm font-semibold text-[#a8a49a] transition hover:text-[var(--color-stellar)]">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Ecosystem + explorer */}
          <div>
            <h4 className="font-num mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-stellar)]">{f.ecosystemTitle}</h4>
            <div className="flex flex-col gap-2.5">
              {ECOSYSTEM.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" data-cursor className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#a8a49a] transition hover:text-[var(--color-stellar)]">
                  {label}
                  <ArrowUpRight className="size-3" />
                </a>
              ))}
              <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer" data-cursor className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#a8a49a] transition hover:text-[var(--color-stellar)]">
                {dict.cta.explorer}
                <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t-[3px] border-[#a8a49a] pt-5 text-xs font-medium text-[#a8a49a] md:flex-row md:items-center md:justify-between">
          <span>{f.rights}</span>
          <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" data-cursor className="font-display inline-flex items-center gap-1.5 text-sm text-[var(--color-stellar)] transition hover:text-[var(--color-surface)]">
            {f.event}
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
