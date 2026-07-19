import { operationService } from "#/containers/operation.container";
import { libraryRepository } from "#/containers/repository.container";
import { RemixTagProducer } from "#/lib/producers/remix-tag";
import { RenamerProducer } from "#/lib/producers/renamer";
import { ProducerRepository } from "#/repositories/producer.repository";
import { ProducerService } from "#/services/producer.service";

const producerRepository = new ProducerRepository();

producerRepository.register(new RenamerProducer());
producerRepository.register(new RemixTagProducer());

const producerService = new ProducerService(
  libraryRepository,
  producerRepository,
  operationService,
);

export { producerService };
