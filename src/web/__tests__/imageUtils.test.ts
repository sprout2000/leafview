import { describe, expect, it } from "vitest";

import {
  getImageAfterRemoval,
  getNextImage,
  getPrevImage,
  getScalePercent,
  getZoom,
} from "../imageUtils";

const list = ["/pics/a.png", "/pics/b.png", "/pics/c.png"];

describe("getNextImage", () => {
  it("returns the following image", () => {
    expect(getNextImage(list, "/pics/a.png")).toBe("/pics/b.png");
    expect(getNextImage(list, "/pics/b.png")).toBe("/pics/c.png");
  });

  it("wraps around to the first image", () => {
    expect(getNextImage(list, "/pics/c.png")).toBe("/pics/a.png");
  });

  it("returns the first image when the current one is missing", () => {
    expect(getNextImage(list, "/pics/removed.png")).toBe("/pics/a.png");
  });
});

describe("getPrevImage", () => {
  it("returns the preceding image", () => {
    expect(getPrevImage(list, "/pics/c.png")).toBe("/pics/b.png");
    expect(getPrevImage(list, "/pics/b.png")).toBe("/pics/a.png");
  });

  it("wraps around to the last image", () => {
    expect(getPrevImage(list, "/pics/a.png")).toBe("/pics/c.png");
  });

  it("returns the first image when the current one is missing", () => {
    expect(getPrevImage(list, "/pics/removed.png")).toBe("/pics/a.png");
  });
});

describe("getImageAfterRemoval", () => {
  it("shows the image that moved into the removed position", () => {
    // removed "/pics/b.png" (index 1) from [a, b, c]
    expect(getImageAfterRemoval(["/pics/a.png", "/pics/c.png"], 1)).toBe(
      "/pics/c.png",
    );
  });

  it("wraps around to the first image when the last one was removed", () => {
    // removed "/pics/c.png" (index 2) from [a, b, c]
    expect(getImageAfterRemoval(["/pics/a.png", "/pics/b.png"], 2)).toBe(
      "/pics/a.png",
    );
  });
});

describe("getZoom", () => {
  it("does not enlarge images smaller than the viewport", () => {
    expect(getZoom(100, 800, 100, 600)).toBe(1);
  });

  it("returns 1 when the image exactly fits", () => {
    expect(getZoom(800, 800, 600, 600)).toBe(1);
  });

  it("fits a wide image to the viewport width", () => {
    expect(getZoom(1600, 800, 600, 600)).toBe(0.5);
  });

  it("fits a tall image to the viewport height", () => {
    expect(getZoom(400, 800, 2400, 600)).toBe(0.25);
  });

  it("uses the smaller ratio when both sides overflow", () => {
    expect(getZoom(1600, 800, 3000, 600)).toBe(0.2);
  });
});

describe("getScalePercent", () => {
  it("returns 100% for an image shown at its actual size", () => {
    expect(getScalePercent(1, 0)).toBe(100);
  });

  it("takes the fitting ratio into account", () => {
    expect(getScalePercent(0.5, 0)).toBe(50);
    expect(getScalePercent(0.25, 0)).toBe(25);
  });

  it("doubles the scale for each zoom level", () => {
    expect(getScalePercent(1, 1)).toBe(200);
    expect(getScalePercent(1, -1)).toBe(50);
    expect(getScalePercent(0.5, 2)).toBe(200);
  });

  it("rounds fractional zoom levels", () => {
    // 2 ** 0.3 = 1.2311...
    expect(getScalePercent(1, 0.3)).toBe(123);
    expect(getScalePercent(0.5, 0.3)).toBe(62);
  });
});
