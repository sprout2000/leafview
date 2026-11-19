import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  checkmime,
  getDotfilesPrefix,
  isDotfile,
  readImageDir,
  resolveExistingDir,
} from "../fileUtils";

describe("checkmime", () => {
  it.each([
    "a.bmp",
    "a.gif",
    "a.ico",
    "a.jpg",
    "a.jpeg",
    "a.png",
    "a.svg",
    "a.webp",
  ])("accepts %s", (file) => {
    expect(checkmime(file)).toBe(true);
  });

  it("ignores the case of the extension", () => {
    expect(checkmime("/path/to/PHOTO.JPG")).toBe(true);
  });

  it.each(["a.txt", "a.pdf", "a.mp4", "a.webm", "a.tiff", "noext", ""])(
    "rejects %s",
    (file) => {
      expect(checkmime(file)).toBe(false);
    },
  );
});

describe("getDotfilesPrefix / isDotfile", () => {
  it("treats every dotfile as hidden on macOS", () => {
    expect(getDotfilesPrefix("darwin")).toBe(".");
    expect(isDotfile("/pics/.hidden.png", "darwin")).toBe(true);
    expect(isDotfile("/pics/._a.png", "darwin")).toBe(true);
    expect(isDotfile("/pics/a.png", "darwin")).toBe(false);
  });

  it.each(["win32", "linux"] as const)(
    "only treats AppleDouble files as hidden on %s",
    (platform) => {
      expect(getDotfilesPrefix(platform)).toBe("._");
      expect(isDotfile("/pics/._a.png", platform)).toBe(true);
      expect(isDotfile("/pics/.hidden.png", platform)).toBe(false);
      expect(isDotfile("/pics/a.png", platform)).toBe(false);
    },
  );

  it("only looks at the base name", () => {
    expect(isDotfile("/.config/pics/a.png", "darwin")).toBe(false);
  });
});

describe("readImageDir", () => {
  let dir: string;

  beforeAll(async () => {
    dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "leafview-"));

    for (const name of [
      "c.png",
      "a.jpg",
      "b.webp",
      "note.txt",
      ".hidden.png",
      "._apple.png",
    ]) {
      await fs.promises.writeFile(path.join(dir, name), "");
    }
    await fs.promises.mkdir(path.join(dir, "folder.png"));
  });

  afterAll(async () => {
    await fs.promises.rm(dir, { recursive: true, force: true });
  });

  it("returns sorted absolute paths of image files only (macOS)", async () => {
    const list = await readImageDir(dir, "darwin");

    expect(list).toEqual([
      path.join(dir, "a.jpg"),
      path.join(dir, "b.webp"),
      path.join(dir, "c.png"),
    ]);
  });

  it("keeps plain dotfiles but skips AppleDouble files (other platforms)", async () => {
    const list = await readImageDir(dir, "linux");

    expect(list).toEqual([
      path.join(dir, ".hidden.png"),
      path.join(dir, "a.jpg"),
      path.join(dir, "b.webp"),
      path.join(dir, "c.png"),
    ]);
  });

  it("resolves relative directories", async () => {
    const relative = path.relative(process.cwd(), dir);
    const list = await readImageDir(relative, "darwin");

    expect(list.every((item) => path.isAbsolute(item))).toBe(true);
  });

  it("rejects when the directory does not exist", async () => {
    await expect(
      readImageDir(path.join(dir, "does-not-exist")),
    ).rejects.toThrow();
  });
});

describe("resolveExistingDir", () => {
  const fallback = "/home/user/Pictures";
  let dir: string;
  let file: string;

  beforeAll(async () => {
    dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "leafview-"));
    file = path.join(dir, "a.png");
    await fs.promises.writeFile(file, "");
  });

  afterAll(async () => {
    await fs.promises.rm(dir, { recursive: true, force: true });
  });

  it("returns an existing directory", () => {
    expect(resolveExistingDir(dir, fallback)).toBe(dir);
  });

  it("falls back when nothing is remembered", () => {
    expect(resolveExistingDir(undefined, fallback)).toBe(fallback);
    expect(resolveExistingDir("", fallback)).toBe(fallback);
  });

  it("falls back when the directory no longer exists", () => {
    expect(resolveExistingDir(path.join(dir, "removed"), fallback)).toBe(
      fallback,
    );
  });

  it("falls back when the path is a file", () => {
    expect(resolveExistingDir(file, fallback)).toBe(fallback);
  });
});
