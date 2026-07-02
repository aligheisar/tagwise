import type { Command } from "@/domain/shared/command";

export interface CommandHandler<T extends Command, R = Promise<void>> {
  execute(command: T): R;
}
