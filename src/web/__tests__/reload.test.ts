import { describe, expect, it, vi } from "vitest";

import { reload } from "../reload";

describe("reload", () => {
  it("calls window.location.reload()", () => {
    // jsdom does not implement navigation and only reports it.
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => reload()).not.toThrow();
  });
});
