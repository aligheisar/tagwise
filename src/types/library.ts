import type { FolderScanItem } from "taglib-wasm";

type Library = {
  items: FolderScanItem[];
  root: string;
  cachedAt: Date;
};

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
    : T;

type ReadonlyLibrary = DeepReadonly<Library>;

export type { Library, ReadonlyLibrary };
