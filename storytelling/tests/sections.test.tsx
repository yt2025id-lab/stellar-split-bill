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
  it("renders the Trustless ROSCA headline and a primary link to the dApp", () => {
    withLocale(<SceneHero active />);
    expect(screen.getByText("ROSCA")).toBeInTheDocument();
    expect(screen.getByText("Trustless")).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /join arisan now/i });
    expect(cta).toHaveAttribute("href", "https://suivan.vercel.app");
  });
});

describe("text sections", () => {
  it("Akar renders its title and stat", () => {
    withLocale(<Akar />);
    expect(screen.getByText(/rotating savings/i)).toBeInTheDocument();
    expect(screen.getByText("100M+")).toBeInTheDocument();
  });
  it("Percikan renders its title", () => {
    withLocale(<Percikan />);
    expect(screen.getByText(/brought it on-chain/i)).toBeInTheDocument();
  });
  it("Retakan renders its title", () => {
    withLocale(<Retakan />);
    expect(screen.getByText(/old way breaks/i)).toBeInTheDocument();
  });
});

describe("Tempaan", () => {
  it("renders the 125% formula", () => {
    withLocale(<Tempaan />);
    expect(screen.getByText(/125% × members × contribution per period/i)).toBeInTheDocument();
  });
});

describe("Nyala", () => {
  it("renders both yield streams merging into double yield", () => {
    withLocale(<Nyala />);
    expect(screen.getByText("Collateral")).toBeInTheDocument();
    expect(screen.getByText("Monthly dues")).toBeInTheDocument();
    expect(screen.getByText("Double yield")).toBeInTheDocument();
  });
});

describe("Sistem", () => {
  it("renders all 9 rules and the 3 timeline steps", () => {
    withLocale(<Sistem />);
    expect(screen.getAllByTestId("rule")).toHaveLength(9);
    expect(screen.getAllByTestId("timeline-step")).toHaveLength(3);
    expect(screen.getByText("Draw winner")).toBeInTheDocument();
  });
});

describe("Cta", () => {
  it("links the primary button to the dApp", () => {
    withLocale(<Cta />);
    const launch = screen.getByRole("link", { name: /launch the app/i });
    expect(launch).toHaveAttribute("href", "https://suivan.vercel.app");
  });
});
