import type { Command } from "@/domain/shared/command";
import type { CommandHandler } from "@/domain/shared/command-handler";

export interface CommandBus {
  execute<T extends Command>(command: T): Promise<void>;
  register<T extends Command>(
    command: Command,
    handler: CommandHandler<T>,
  ): void;
}
