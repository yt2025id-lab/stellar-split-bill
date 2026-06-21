import { Retakan } from "@/components/sections/Retakan";
import { Tempaan } from "@/components/sections/Tempaan";
import { Nyala } from "@/components/sections/Nyala";
import { Sistem } from "@/components/sections/Sistem";
import { Galeri } from "@/components/sections/Galeri";
import { Bukti } from "@/components/sections/Bukti";
import { Cta } from "@/components/sections/Cta";
import { Marquee } from "@/components/ui/Marquee";
import { StripeMarquee } from "@/components/ui/StripeMarquee";
import { SceneDeck } from "@/components/scenes/SceneDeck";
import { SceneHero } from "@/components/scenes/SceneHero";
import { SceneAkar } from "@/components/scenes/SceneAkar";
import { ScenePercikan } from "@/components/scenes/ScenePercikan";

const KEYWORDS = [
  "Bill splitting reimagined",
  "On-chain trust",
  "125% collateral",
  "Double yield",
  "Gasless onboarding",
  "Verifiable randomness",
  "Built on Stellar",
  "Split bill, evolved",
];

// Stellar Soroban smart contracts power everything.
const PARTNERS = [
  "XLM",
  "Walrus",
  "DeepBook",
  "Scallop",
  "Cetus",
  "Seal",
  "Aftermath",
  "Navi",
  "Bluefin",
  "Turbos",
];

export default function Home() {
  return (
    <main className="relative z-10">
      {/* Fixed-stage prototype: Hero → Akar → Percikan cross-fade in place */}
      <SceneDeck scenes={[SceneHero, SceneAkar, ScenePercikan]} />

      <Marquee items={KEYWORDS} />

      {/* Normal scroll flow resumes - tilted yellow stripes divide the scenes */}
      <div style={{ background: "rgba(232,24,10,0.05)" }}>
        <Retakan />
      </div>

      <div className="relative z-20 -my-6 lg:-my-10">
        <StripeMarquee items={PARTNERS} className="rotate-2" />
      </div>
      <div style={{ background: "rgba(10,157,110,0.05)" }}>
        <Tempaan />
      </div>

      <div className="relative z-20 -my-6 lg:-my-10">
        <StripeMarquee items={KEYWORDS} className="-rotate-2" />
      </div>
      <div style={{ background: "rgba(10,157,110,0.045)" }}>
        <Nyala />
      </div>

      <div className="relative z-20 -my-6 lg:-my-10">
        <StripeMarquee items={PARTNERS} className="rotate-2" />
      </div>
      <div style={{ background: "rgba(12,140,233,0.05)" }}>
        <Sistem />
      </div>

      <div className="relative z-20 -my-6 lg:-my-10">
        <StripeMarquee items={KEYWORDS} className="-rotate-2" />
      </div>
      <div style={{ background: "rgba(12,140,233,0.045)" }}>
        <Galeri />
      </div>

      <div className="relative z-20 -my-6 lg:-my-10">
        <StripeMarquee items={PARTNERS} className="rotate-2" />
      </div>
      <div style={{ background: "rgba(10,157,110,0.05)" }}>
        <Bukti />
      </div>

      <div style={{ background: "rgba(12,140,233,0.07)" }}>
        <Cta />
      </div>
    </main>
  );
}
