import { describe, expect, it } from "vitest";
import {
  DEV_API_URL,
  PROD_API_URL,
  resolveBaseUrl,
} from "../../src/core/config/endpoints";

describe("resolveBaseUrl", () => {
  it("uses dev url when isDev is true", () => {
    expect(resolveBaseUrl({ isDev: true })).toBe(DEV_API_URL);
  });

  it("falls back to production url", () => {
    expect(resolveBaseUrl({})).toBe(PROD_API_URL);
    expect(resolveBaseUrl({ isDev: false })).toBe(PROD_API_URL);
  });
});
