import type { FolderScanItem } from "taglib-wasm";

type Library = {
  items: FolderScanItem[];
  root: string;
  cachedAt: Date;
};

export type { Library };
