import { OperationRepository } from "#/repositories/operation.repository";
import { OperationService } from "#/services/operation.service";

const operationRepository = new OperationRepository();

const operationService = new OperationService(operationRepository);

export { operationService };
