import type { Command } from "@/domain/shared/command";

export class PurgeCacheCommand implements Command {
  constructor(public readonly folder?: string) {}
}
