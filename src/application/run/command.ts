import type { Command } from "@/domain/shared/command";

export class RunCommand implements Command {
  constructor(
    public readonly producerName: string,
    public readonly root: string,
  ) {}
}
