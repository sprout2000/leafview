import { describe, expect, it } from "vitest";

import {
  getImageAfterRemoval,
  getNextImage,
  getPrevImage,
  getZoom,
  toFileUrl,
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
  it("shows the image that sorted after the removed one", () => {
    // "/pics/b.png" was removed from [a, b, c]
    expect(
      getImageAfterRemoval(["/pics/a.png", "/pics/c.png"], "/pics/b.png"),
    ).toBe("/pics/c.png");
  });

  it("wraps around to the first image when the last one was removed", () => {
    expect(
      getImageAfterRemoval(["/pics/a.png", "/pics/b.png"], "/pics/c.png"),
    ).toBe("/pics/a.png");
  });

  it("skips several images removed at once", () => {
    // b, c and d were removed from [a, b, c, d, e]
    expect(
      getImageAfterRemoval(["/pics/a.png", "/pics/e.png"], "/pics/c.png"),
    ).toBe("/pics/e.png");
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

describe("toFileUrl", () => {
  it.each([
    ["/Users/me/Pictures/a.png", "file:///Users/me/Pictures/a.png"],
    ["C:\\Users\\me\\Pictures\\a.png", "file:///C:/Users/me/Pictures/a.png"],
    ["C:/Users/me/Pictures/a.png", "file:///C:/Users/me/Pictures/a.png"],
    ["\\\\server\\share\\a.png", "file://server/share/a.png"],
  ])("converts %s", (filepath, expected) => {
    expect(toFileUrl(filepath)).toBe(expected);
  });

  it.each([
    // the reported issue: "#" was treated as the start of a URL fragment
    ["C:\\Users\\me\\#1\\a.png", "file:///C:/Users/me/%231/a.png"],
    ["/Users/me/#1/a.png", "file:///Users/me/%231/a.png"],
    ["\\\\server\\share\\#1\\a.png", "file://server/share/%231/a.png"],
    ["/pics/what?.png", "file:///pics/what%3F.png"],
    ["/pics/100%/a.png", "file:///pics/100%25/a.png"],
    ["/pics/my photo.png", "file:///pics/my%20photo.png"],
    ["/pics/写真.png", "file:///pics/%E5%86%99%E7%9C%9F.png"],
  ])("encodes special characters in %s", (filepath, expected) => {
    expect(toFileUrl(filepath)).toBe(expected);
  });

  it("keeps backslashes in POSIX file names", () => {
    expect(toFileUrl("/pics/back\\slash.png")).toBe(
      "file:///pics/back%5Cslash.png",
    );
  });

  it.each([
    "/Users/me/#1/a.png",
    "C:\\Users\\me\\#1\\a.png",
    "/pics/100%/what?.png",
  ])("does not leave a fragment or query in the URL (%s)", (filepath) => {
    const url = new URL(toFileUrl(filepath));

    expect(url.hash).toBe("");
    expect(url.search).toBe("");
    expect(url.protocol).toBe("file:");
  });
});
