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
  const extPath = path.join(os.homedir(), extDir, reactDevtools);

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
