import { describe, expect, it } from "vitest";

import resolveHref from "./tailscale-href";

describe("utils/tailscale-href", () => {
  it("returns the public href when tailscale links are off", () => {
    expect(resolveHref({ href: "https://example.com", tailscaleHref: "https://example.ts.net" }, false)).toBe(
      "https://example.com",
    );
  });

  it("returns the tailscale href when tailscale links are on", () => {
    expect(resolveHref({ href: "https://example.com", tailscaleHref: "https://example.ts.net" }, true)).toBe(
      "https://example.ts.net",
    );
  });

  it("falls back to the public href when no tailscale href is configured", () => {
    expect(resolveHref({ href: "https://example.com" }, true)).toBe("https://example.com");
  });
});
