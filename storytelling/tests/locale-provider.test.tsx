import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider, useDict, useLocale } from "@/lib/i18n/LocaleProvider";

function Probe() {
  const dict = useDict();
  const { locale, toggle } = useLocale();
  return (
    <div>
      <span data-testid="launch">{dict.nav.launch}</span>
      <span data-testid="locale">{locale}</span>
      <button onClick={toggle}>switch</button>
    </div>
  );
}

describe("LocaleProvider", () => {
  it("defaults to English and toggles to Indonesian", async () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>
    );
    expect(screen.getByTestId("launch").textContent).toBe("Launch App");
    expect(screen.getByTestId("locale").textContent).toBe("en");

    await userEvent.click(screen.getByText("switch"));

    expect(screen.getByTestId("locale").textContent).toBe("id");
    expect(screen.getByTestId("launch").textContent).toBe("Buka Aplikasi");
  });
});
