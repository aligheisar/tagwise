import type { FolderScanOptions } from "taglib-wasm/folder";

const scanFolderOptions = (options?: Partial<FolderScanOptions>) => ({
  continueOnError: true,
  includeProperties: false,
  recursive: true,
  ...options,
});

export { scanFolderOptions };
