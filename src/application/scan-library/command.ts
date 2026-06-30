import type { Command } from "@/domain/shared/command";
import type { ScanOptions } from "@/domain/shared/ports";

export class ScanLibraryCommand implements Command {
  constructor(
    public readonly root: string,
    public readonly options?: ScanOptions,
  ) {}
}
