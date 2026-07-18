import { operationService } from "@/containers/operation.container";
import { RemixTagProducer } from "@/lib/producers/remix-tag";
import { RenamerProducer } from "@/lib/producers/renamer";
import { LibraryRepository } from "@/repositories/library.repository";
import { ProducerRepository } from "@/repositories/producer.repository";
import { ProducerService } from "@/services/producer.service";

const libraryRepository = new LibraryRepository();
const producerRepository = new ProducerRepository();

producerRepository.register(new RenamerProducer());
producerRepository.register(new RemixTagProducer());

const producerService = new ProducerService(
  libraryRepository,
  producerRepository,
  operationService,
);

export { producerService };
