import fs from "node:fs";

/** Delay to coalesce the burst of events fs.watch emits for one change (ms). */
export const DIR_WATCH_DELAY = 200;

/**
 * Watches one directory at a time and calls `onChange` (debounced) when files
 * in it are added, removed or renamed. Watching another directory stops
 * watching the previous one.
 */
export const createDirWatcher = (
  onChange: (dir: string) => void,
  delay = DIR_WATCH_DELAY,
) => {
  let watcher: fs.FSWatcher | null = null;
  let watchedDir = "";
  let timer: ReturnType<typeof setTimeout> | null = null;

  const close = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    watcher?.close();
    watcher = null;
    watchedDir = "";
  };

  const watch = (dir: string) => {
    if (dir === watchedDir) return;

    close();

    try {
      watcher = fs.watch(dir, () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          timer = null;
          onChange(dir);
        }, delay);
      });
    } catch (err) {
      console.log(err);
      return;
    }

    watchedDir = dir;

    // For example, the directory itself was removed. Let the renderer check
    // the directory again, and stop watching it.
    watcher.on("error", (err) => {
      console.log(err);
      close();
      onChange(dir);
    });
  };

  return { watch, close };
};
