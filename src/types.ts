import type { TagInput } from "taglib-wasm";

type Error = {
  message: string;
  type: "Rename" | "Reading" | "Writing" | "Tagging";
};
type FolderScanItemError = {
  path: string;
  error: Error;
};

type UpdateFolderInput = Array<{
  path: string;
  tags: Partial<TagInput>;
}>;

type UpdateFolderOptions = {
  continueOnError?: boolean;
  concurrency?: number;
  signal?: AbortSignal;
};

type RenameResult = {
  newName: string;
  oldName: string;
  path: string;
};

export type {
  FolderScanItemError,
  RenameResult,
  UpdateFolderInput,
  UpdateFolderOptions,
};
