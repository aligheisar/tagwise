import type { ScanResult } from "@/domain/media-item/entity";

type ScanOptions = {
  recursive?: boolean;
  continueOnError?: boolean;
  signal?: AbortSignal;
};

type TagUpdate = {
  path: string;
  tags: Record<string, string | number>;
};

interface ScannerPort {
  scan(root: string, options?: ScanOptions): Promise<ScanResult>;
}

interface TagWriterPort {
  updateTags(updates: TagUpdate[]): Promise<void>;
}

interface FilesystemPort {
  exists(path: string): Promise<boolean>;
  hasChangedSince(dir: string, since: Date): Promise<boolean>;
  rename(oldPath: string, newPath: string): Promise<void>;
}

export type {
  FilesystemPort,
  ScannerPort,
  ScanOptions,
  TagUpdate,
  TagWriterPort,
};
