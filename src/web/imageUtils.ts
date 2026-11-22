/**
 * Returns the image that follows `current` in `list`.
 * Wraps around to the first image at the end of the list,
 * and falls back to the first image when `current` is not in the list.
 */
export const getNextImage = (list: string[], current: string) => {
  const index = list.indexOf(current);

  if (index === list.length - 1 || index === -1) return list[0];

  return list[index + 1];
};

/**
 * Returns the image that precedes `current` in `list`.
 * Wraps around to the last image at the start of the list,
 * and falls back to the first image when `current` is not in the list.
 */
export const getPrevImage = (list: string[], current: string) => {
  const index = list.indexOf(current);

  if (index === 0) return list[list.length - 1];
  if (index === -1) return list[0];

  return list[index - 1];
};

/**
 * Returns the image to show after the image at `removedIndex` was removed.
 * `newList` is the list after the removal.
 */
export const getImageAfterRemoval = (
  newList: string[],
  removedIndex: number,
) => (removedIndex > newList.length - 1 ? newList[0] : newList[removedIndex]);

/**
 * Returns the image to show after `removed` was deleted outside the app.
 * `list` is sorted (see readImageDir) and no longer contains `removed`, so
 * the next image is the first one that sorts after it. Wraps around to the
 * first image.
 */
export const getImageAfterExternalRemoval = (list: string[], removed: string) =>
  list.find((item) => item > removed) ?? list[0];

/**
 * Returns the zoom ratio that fits an image (iw x ih) into
 * the viewport (w x h). Images smaller than the viewport are not enlarged.
 */
export const getZoom = (iw: number, w: number, ih: number, h: number) => {
  if (iw > w || ih > h) {
    const zoomX = w / iw;
    const zoomY = h / ih;
    return Math.min(zoomX, zoomY);
  }
  return 1;
};

const encodeSegments = (filepath: string) =>
  filepath
    .split("/")
    .map((segment) =>
      // Keep Windows drive letters ("C:") as they are.
      /^[A-Za-z]:$/.test(segment) ? segment : encodeURIComponent(segment),
    )
    .join("/");

/**
 * Converts a local file path into a file:// URL.
 *
 * Using a raw path as a URL breaks on characters that have a meaning in URLs,
 * such as "#" (fragment), "?" (query) and "%" (escape). Every path segment is
 * percent-encoded so that they are treated as part of the file name.
 *
 * - POSIX:   /Users/me/a#b/c.png  -> file:///Users/me/a%23b/c.png
 * - Windows: C:\Users\a#b\c.png  -> file:///C:/Users/a%23b/c.png
 * - UNC:     \\server\share\c.png -> file://server/share/c.png
 */
export const toFileUrl = (filepath: string) => {
  const isWindowsPath = /^(?:[A-Za-z]:[\\/]|\\\\)/.test(filepath);
  // Backslashes are separators only on Windows; on macOS / Linux they are
  // valid characters in file names.
  const normalized = isWindowsPath ? filepath.replace(/\\/g, "/") : filepath;

  // UNC path: "//server/share/..." -> "file://server/share/..."
  if (normalized.startsWith("//")) return `file:${encodeSegments(normalized)}`;

  // "C:/..." -> "/C:/..."
  const absolute = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `file://${encodeSegments(absolute)}`;
};
