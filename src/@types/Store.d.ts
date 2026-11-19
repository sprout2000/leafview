declare type StoreType = {
  ask: boolean;
  x: number | undefined;
  y: number | undefined;
  width: number | undefined;
  height: number | undefined;
  language?: string;
  darkmode: boolean;
  /** The folder of the image opened last time. */
  lastDir?: string;
};
