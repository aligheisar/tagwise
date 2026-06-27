import type { UpdateFolderOptions } from "../types";

const updateFolderOptions = (options?: Partial<UpdateFolderOptions>) => ({
  concurrency: 8,
  continueOnError: true,
  ...options,
});

export { updateFolderOptions };
