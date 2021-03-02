import os from 'os';
import fs from 'fs';
import path from 'path';

export const searchDevtools = async (): Promise<string> => {
  const isDarwin = os.platform() === 'darwin';
  const extDir = isDarwin
    ? '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi'
    : '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions';
  const extPath = path.join(os.homedir(), extDir);

  const reactDevtoolsDir = await fs.promises
    .readdir(extPath, { withFileTypes: true })
    .then((dirents) =>
      dirents
        .filter((dirent) => dirent.isDirectory())
        .map(({ name }) => path.resolve(extPath, name))
    );

  return reactDevtoolsDir[0];
};
