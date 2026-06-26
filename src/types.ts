type Error = {
  message: string;
  type: "Rename" | "Reading" | "Writing" | "Tagging";
};
type FolderScanItemError = {
  path: string;
  error: Error;
};

type RenameResult = {
  newName: string;
  oldName: string;
  path: string;
};

export type { FolderScanItemError, RenameResult };
