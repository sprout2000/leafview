import fs from "node:fs";
import path from "node:path";

import mime from "mime-types";

/**
 * Prefix of files that should be ignored.
 * macOS: all dotfiles / other platforms: AppleDouble files ("._*").
 */
export const getDotfilesPrefix = (
  platform: NodeJS.Platform = process.platform,
) => (platform === "darwin" ? "." : "._");

export const isDotfile = (
  filepath: string,
  platform: NodeJS.Platform = process.platform,
) => path.basename(filepath).startsWith(getDotfilesPrefix(platform));

export const checkmime = (filepath: string) => {
  const regexp = new RegExp(/bmp|ico|gif|jpeg|png|svg|webp/);
  const mimetype = mime.lookup(filepath);

  return (mimetype && regexp.test(mimetype)) || false;
};

/**
 * Returns the sorted absolute paths of the image files in `dir`,
 * excluding directories and dotfiles.
 */
export const readImageDir = async (
  dir: string,
  platform: NodeJS.Platform = process.platform,
) => {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });

  return dirents
    .filter((dirent) => dirent.isFile())
    .filter(({ name }) => !isDotfile(name, platform))
    .map(({ name }) => path.resolve(dir, name))
    .filter((item) => checkmime(item))
    .sort();
};
