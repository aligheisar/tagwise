import type { Command } from "@/domain/shared/command";

export interface CommandHandler<T extends Command> {
  execute(command: T): Promise<void>;
}
