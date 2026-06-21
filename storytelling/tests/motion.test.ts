import { describe, it, expect, vi, afterEach } from "vitest";
import { prefersReducedMotion } from "@/lib/motion";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

describe("prefersReducedMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns true when the OS prefers reduced motion", () => {
    mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it("returns false otherwise", () => {
    mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });
});
