import os from 'os';
import fs from 'fs';
import path from 'path';

export const searchDevtools = async (): Promise<string | void | undefined> => {
  const isWin32 = os.platform() === 'win32';
  const isDarwin = os.platform() === 'darwin';

  const extDir = isDarwin
    ? '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi'
    : isWin32
    ? '/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi'
    : '/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi';
  const extPath = path.join(os.homedir(), extDir);

  return await fs.promises
    .readdir(extPath, { withFileTypes: true })
    .then((dirents) =>
      dirents
        .filter((dirent) => dirent.isDirectory())
        .map(({ name }) => path.resolve(extPath, name))
        .shift()
    )
    .catch((err) => console.log(err));
};
