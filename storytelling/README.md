# Suivan — Storytelling Site

An interactive, scroll-driven storytelling website for **Suivan**, an on-chain
**ROSCA** (rotating savings circle / Indonesian *arisan*) protocol built natively
on the **Sui** blockchain. The site narrates how a centuries-old, trust-based
savings tradition is brought on-chain, and funnels visitors to the live dApp.

> **Tagline:** Moving trust into code.

- **Live dApp:** https://suivan.vercel.app
- **Story:** arisan → bring it on-chain → the trust problem → 125% collateral →
  double yield → the on-chain system → the Sui stack → proof → join.

## Features

- **Cinematic scrollytelling** — a fixed-stage intro deck (the viewport stays
  still while scenes cross-fade in place) followed by section-by-section
  pin-and-reveal storytelling, so each beat can be read fully before moving on.
- **Element-level motion** — headlines, copy, cards and graphics reveal in
  sequence as you scroll; nothing is just a static fade-in.
- **Light neo-brutalism** — bold ink borders, hard offset shadows, Bebas Neue
  display type, and a per-section tinted background with a meaning-carrying
  "ghost" word (e.g. a red **TRUST** on *The Crack*).
- **Brand identity** — the Suivan community-circle emblem across the nav,
  intro, hero, and closing sign-off.
- **Bilingual (EN / ID)** — instant language switch.
- **Custom-built SVG graphics** — generated in code, scroll-reactive (lines
  draw themselves on scroll), no external/stock assets.
- **Accessible & responsive** — full `prefers-reduced-motion` support and a
  clean mobile fallback (pinned/horizontal sequences degrade to normal scroll).

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [GSAP](https://gsap.com/) + ScrollTrigger, [Lenis](https://lenis.darkroom.engineering/) smooth scroll, [SplitType](https://github.com/lukePeavey/SplitType)
- [Vitest](https://vitest.dev/) + Testing Library
- Deployed on [Vercel](https://vercel.com/)

## Getting Started

```bash
# install dependencies
npm install

# run the dev server (http://localhost:3000)
npm run dev

# production build
npm run build

# run tests
npm test
```

## Project Structure

```
app/                 # Next.js App Router: layout, page, global styles, favicon
components/
  scenes/            # fixed-stage intro deck (Hero / Akar / Percikan)
  sections/          # pinned story sections (Retakan, Tempaan, Nyala, Sistem, …)
  graphics/          # code-generated SVG motifs + scroll-reactive art
  brand/             # Suivan logo / mark
  motion/            # reusable GSAP hooks (reveal, pin, parallax, magnetic, …)
  fx/                # preloader, custom cursor, grid texture
  ui/                # buttons, nav, marquee, ghost word, language switch
lib/
  i18n/              # EN/ID dictionaries + locale provider
  motion.ts          # reduced-motion + ScrollTrigger helpers
  reveal.ts          # progress-driven reveal utilities
```

## Accessibility

All non-essential motion is disabled when the operating system requests
**reduced motion**, and pinned / horizontal scroll sequences fall back to a
plain vertical layout on small screens.

---

Built by the **ARSUI Team** for the Suivan protocol.
