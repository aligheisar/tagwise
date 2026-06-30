type DomainError = {
  message: string;
  type: "Rename" | "Reading" | "Writing" | "Tagging";
};

type FolderScanItemError = {
  path: string;
  error: DomainError;
};

type RenameResult = {
  newName: string;
  oldName: string;
  path: string;
};

export type { DomainError, FolderScanItemError, RenameResult };
