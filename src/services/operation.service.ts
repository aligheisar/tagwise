import type { OperationRepository } from "#/repositories/operation.repository";
import type { Operation } from "#/types/operation";

class OperationService {
  constructor(private readonly operationRepository: OperationRepository) {}

  add(...operation: Operation[]): void {
    this.operationRepository.add(...operation);
  }

  getAll(): Operation[] {
    return this.operationRepository.getAll();
  }
}

export { OperationService };
