import { EventEmitter } from "node:events";
import fs from "node:fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createDirWatcher, DIR_WATCH_DELAY } from "../dirWatcher";

class FakeWatcher extends EventEmitter {
  close = vi.fn();
}

/** The watchers created by fs.watch(), with the listener passed to it. */
let watchers: { dir: string; watcher: FakeWatcher; listener: () => void }[];

const latest = () => {
  const entry = watchers.at(-1);
  if (!entry) throw new Error("fs.watch() was not called");
  return entry;
};

beforeEach(() => {
  vi.useFakeTimers();
  watchers = [];
  vi.spyOn(fs, "watch").mockImplementation(((
    dir: string,
    listener: () => void,
  ) => {
    const watcher = new FakeWatcher();
    watchers.push({ dir, watcher, listener });
    return watcher as unknown as fs.FSWatcher;
  }) as unknown as typeof fs.watch);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createDirWatcher", () => {
  it("watches the directory", () => {
    const { watch } = createDirWatcher(vi.fn());

    watch("/pics");

    expect(fs.watch).toHaveBeenCalledWith("/pics", expect.any(Function));
  });

  it("notifies once after a burst of events", () => {
    const onChange = vi.fn();
    const { watch } = createDirWatcher(onChange);
    watch("/pics");

    latest().listener();
    latest().listener();
    vi.advanceTimersByTime(DIR_WATCH_DELAY - 1);
    latest().listener();
    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(DIR_WATCH_DELAY);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("/pics");
  });

  it("uses a custom delay", () => {
    const onChange = vi.fn();
    const { watch } = createDirWatcher(onChange, 50);
    watch("/pics");

    latest().listener();
    vi.advanceTimersByTime(50);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the same directory is watched again", () => {
    const { watch } = createDirWatcher(vi.fn());

    watch("/pics");
    watch("/pics");

    expect(fs.watch).toHaveBeenCalledTimes(1);
  });

  it("stops watching the previous directory", () => {
    const onChange = vi.fn();
    const { watch } = createDirWatcher(onChange);
    watch("/pics/a");
    const previous = latest();
    previous.listener();

    watch("/pics/b");

    expect(previous.watcher.close).toHaveBeenCalled();
    expect(latest().dir).toBe("/pics/b");

    // the pending notification for the previous directory is cancelled
    vi.advanceTimersByTime(DIR_WATCH_DELAY);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("stops watching on close()", () => {
    const onChange = vi.fn();
    const { watch, close } = createDirWatcher(onChange);
    watch("/pics");
    const { watcher, listener } = latest();
    listener();

    close();
    vi.advanceTimersByTime(DIR_WATCH_DELAY);

    expect(watcher.close).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("can watch the same directory again after close()", () => {
    const { watch, close } = createDirWatcher(vi.fn());

    watch("/pics");
    close();
    watch("/pics");

    expect(fs.watch).toHaveBeenCalledTimes(2);
  });

  it("does nothing on close() before watching", () => {
    const { close } = createDirWatcher(vi.fn());

    expect(() => close()).not.toThrow();
  });

  it("logs the error when the directory cannot be watched", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = new Error("ENOENT");
    vi.mocked(fs.watch).mockImplementationOnce(() => {
      throw error;
    });
    const { watch } = createDirWatcher(vi.fn());

    watch("/missing");

    expect(log).toHaveBeenCalledWith(error);

    // not remembered as watched, so it is retried next time
    watch("/missing");
    expect(fs.watch).toHaveBeenCalledTimes(2);
  });

  it("notifies and stops watching on a watcher error", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const onChange = vi.fn();
    const { watch } = createDirWatcher(onChange);
    watch("/pics");
    const { watcher } = latest();
    const error = new Error("EPERM");

    watcher.emit("error", error);

    expect(log).toHaveBeenCalledWith(error);
    expect(watcher.close).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith("/pics");
  });
});
