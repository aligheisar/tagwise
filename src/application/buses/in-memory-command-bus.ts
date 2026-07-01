import type { Command } from "@/domain/shared/command";
import type { CommandBus } from "@/domain/shared/command-bus";
import type { CommandHandler } from "@/domain/shared/command-handler";

export class InMemoryCommandBus implements CommandBus {
  private readonly handlers = new Map<Command, CommandHandler<Command>>();

  register<T extends Command>(command: Command, handler: CommandHandler<T>) {
    this.handlers.set(command, handler);
  }

  async execute<T extends Command>(command: T) {
    const handler = this.handlers.get(command.constructor);
    if (!handler) {
      throw new Error(`No handler registered for ${command.constructor.name}`);
    }

    await handler.execute(command);
  }
}
