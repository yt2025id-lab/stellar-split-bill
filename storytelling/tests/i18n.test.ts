import { describe, it, expect } from "vitest";
import { dictionaries } from "@/lib/i18n/dictionaries";

function keyPaths(obj: unknown, prefix = ""): string[] {
  if (Array.isArray(obj)) {
    return obj.flatMap((v, i) => keyPaths(v, `${prefix}[${i}]`));
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k)
    );
  }
  return [prefix];
}

describe("i18n dictionaries", () => {
  it("en and id have identical key shapes", () => {
    const en = keyPaths(dictionaries.en).sort();
    const id = keyPaths(dictionaries.id).sort();
    expect(id).toEqual(en);
  });

  it("has no empty strings", () => {
    for (const locale of ["en", "id"] as const) {
      for (const [path, value] of Object.entries(flatten(dictionaries[locale]))) {
        expect(value, `${locale}.${path} is empty`).not.toBe("");
      }
    }
  });
});

function flatten(obj: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
    }
  } else {
    out[prefix] = String(obj);
  }
  return out;
}
