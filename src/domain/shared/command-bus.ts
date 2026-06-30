import type { Command } from "@/domain/shared/command";

export interface CommandBus {
  execute<T extends Command>(command: T): Promise<void>;
}
