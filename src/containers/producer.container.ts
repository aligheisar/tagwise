import { RemixTagProducer } from "#/lib/producers/remix-tag";
import { RemoveRemixTagProducer } from "#/lib/producers/remove-remix-tag";
import { RenamerProducer } from "#/lib/producers/renamer";
import { ProducerRepository } from "#/repositories/producer.repository";
import { ProducerService } from "#/services/producer.service";

const producerRepository = new ProducerRepository();

producerRepository.register(new RenamerProducer());
producerRepository.register(new RemixTagProducer());
producerRepository.register(new RemoveRemixTagProducer());

const producerService = new ProducerService(producerRepository);

export { producerService };
