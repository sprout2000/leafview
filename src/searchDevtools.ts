import os from 'os';
import fs from 'fs';
import path from 'path';

export const searchDevtools = async (): Promise<string | void | undefined> => {
  const isWin32 = os.platform() === 'win32';
  const isDarwin = os.platform() === 'darwin';

  const reactDevtools = '/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi';

  const extDir = isDarwin
    ? '/Library/Application Support/Google/Chrome'
    : isWin32
    ? '/AppData/Local/Google/Chrome/User Data'
    : '/.config/google-chrome';
  const dirPath = path.join(os.homedir(), extDir, reactDevtools);

  return fs.promises
    .readdir(dirPath, { withFileTypes: true })
    .then((dirents) =>
      dirents
        .filter((dirent) => dirent.isDirectory())
        .map(({ name }) => path.resolve(dirPath, name))
        .shift()
    )
    .catch((err) => console.log(err));
};
