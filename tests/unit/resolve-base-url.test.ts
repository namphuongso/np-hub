import { describe, expect, it } from "vitest";
import { resolveBaseUrl } from "../../src/core/config/resolve-base-url";
import { DEV_API_URL, PROD_API_URL } from "../../src/core/config/endpoints";

describe("resolveBaseUrl", () => {
  it("uses baseUrl when provided", () => {
    expect(resolveBaseUrl({ baseUrl: "https://custom.example.com" })).toBe(
      "https://custom.example.com"
    );
  });

  it("uses dev url when isDeveloper is true", () => {
    expect(resolveBaseUrl({ isDeveloper: true })).toBe(DEV_API_URL);
  });

  it("falls back to production url", () => {
    expect(resolveBaseUrl({})).toBe(PROD_API_URL);
  });
});
