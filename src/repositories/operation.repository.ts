import type { Operation } from "#/types/operation";

export class OperationRepository {
  private operations: Operation[] = [];

  add(...operation: Operation[]): void {
    this.operations.push(...operation);
  }

  getAll(): Operation[] {
    return this.operations;
  }
}
