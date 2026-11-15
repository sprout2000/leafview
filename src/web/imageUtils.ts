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
