import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SceneHero } from "@/components/scenes/SceneHero";
import { Akar } from "@/components/sections/Akar";
import { Percikan } from "@/components/sections/Percikan";
import { Retakan } from "@/components/sections/Retakan";
import { Tempaan } from "@/components/sections/Tempaan";
import { Nyala } from "@/components/sections/Nyala";
import { Sistem } from "@/components/sections/Sistem";
import { Cta } from "@/components/sections/Cta";

function withLocale(ui: React.ReactNode) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}

describe("SceneHero", () => {
  it("renders the Split Bill headline and a primary link to the dApp", () => {
    withLocale(<SceneHero active />);
    expect(screen.getByText("Bills")).toBeInTheDocument();
    expect(screen.getByText("Stellar")).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /Launch dApp|Buka dApp/i });
    expect(cta).toHaveAttribute("href", "https://split-bill-dapp.vercel.app");
  });
});

describe("text sections", () => {
  it("Akar renders its title and stat", () => {
    withLocale(<Akar />);
    expect(screen.getByText(/splitting bills/i)).toBeInTheDocument();
    const statElements = screen.getAllByText(/Billions|Miliaran/i);
    expect(statElements.length).toBeGreaterThanOrEqual(1);
  });
  it("Percikan renders its title", () => {
    withLocale(<Percikan />);
    expect(screen.getByText(/bills settled/i)).toBeInTheDocument();
  });
  it("Retakan renders its title", () => {
    withLocale(<Retakan />);
    expect(screen.getByText(/old way breaks/i)).toBeInTheDocument();
  });
});

describe("Tempaan", () => {
  it("renders the obligation token formula", () => {
    withLocale(<Tempaan />);
    expect(screen.getByText(/Share\s*=\s*Total/i)).toBeInTheDocument();
  });
});

describe("Nyala", () => {
  it("renders inter-contract communication labels", () => {
    withLocale(<Nyala />);
    expect(screen.getByText("Split Core")).toBeInTheDocument();
    expect(screen.getByText("Split Token")).toBeInTheDocument();
    expect(screen.getByText("Inter-Contract")).toBeInTheDocument();
  });
});

describe("Sistem", () => {
  it("renders all rules and timeline steps", () => {
    withLocale(<Sistem />);
    expect(screen.getAllByTestId("rule")).toHaveLength(9);
    expect(screen.getAllByTestId("timeline-step")).toHaveLength(3);
    expect(screen.getByText(/create bill|buat tagihan/i)).toBeInTheDocument();
  });
});

describe("Cta", () => {
  it("links the primary button to the dApp", () => {
    withLocale(<Cta />);
    const launch = screen.getByRole("link", { name: /launch the app|buka aplikasi/i });
    expect(launch).toHaveAttribute("href", "https://split-bill-dapp.vercel.app");
  });
});
