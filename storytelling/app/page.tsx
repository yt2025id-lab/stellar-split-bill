import { Retakan } from "@/components/sections/Retakan";
import { Tempaan } from "@/components/sections/Tempaan";
import { Nyala } from "@/components/sections/Nyala";
import { Sistem } from "@/components/sections/Sistem";
import { Galeri } from "@/components/sections/Galeri";
import { Bukti } from "@/components/sections/Bukti";
import { Cta } from "@/components/sections/Cta";
import { SceneDeck } from "@/components/scenes/SceneDeck";
import { SceneHero } from "@/components/scenes/SceneHero";
import { SceneAkar } from "@/components/scenes/SceneAkar";
import { ScenePercikan } from "@/components/scenes/ScenePercikan";

export default function Home() {
  return (
    <main className="relative z-10">
      <SceneDeck scenes={[SceneHero, SceneAkar, ScenePercikan]} />

      <div style={{ background: "rgba(232,24,10,0.05)" }}>
        <Retakan />
      </div>

      <div style={{ background: "rgba(10,157,110,0.05)" }}>
        <Tempaan />
      </div>

      <div style={{ background: "rgba(10,157,110,0.045)" }}>
        <Nyala />
      </div>

      <div style={{ background: "rgba(12,140,233,0.05)" }}>
        <Sistem />
      </div>

      <div style={{ background: "rgba(12,140,233,0.045)" }}>
        <Galeri />
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
