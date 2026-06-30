/** biome-ignore-all lint/suspicious/noExplicitAny: no idea */

import type { Command } from "@/domain/shared/command";
import type { CommandBus } from "@/domain/shared/command-bus";
import type { CommandHandler } from "@/domain/shared/command-handler";

type CommandConstructor<T extends Command> = abstract new (
  ...args: never[]
) => T;
export class InMemoryCommandBus implements CommandBus {
  private readonly handlers = new Map<
    CommandConstructor<any>,
    CommandHandler<any>
  >();
  register<T extends Command>(
    command: CommandConstructor<T>,
    handler: CommandHandler<T>,
  ) {
    this.handlers.set(command, handler);
  }
  async execute<T extends Command>(command: T): Promise<void> {
    const handler = this.handlers.get(
      command.constructor as CommandConstructor<T>,
    );
    if (!handler) {
      throw new Error(`No handler registered for ${command.constructor.name}`);
    }

    await handler.execute(command);
  }
}
