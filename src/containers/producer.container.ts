import { config } from "#/config";
import { ArtistTagSeparatorProducer } from "#/lib/producers/artist-tag-separator";
import { RemixTagProducer } from "#/lib/producers/remix-tag";
import { RemoveRemixTagProducer } from "#/lib/producers/remove-remix-tag";
import { RenamerProducer } from "#/lib/producers/renamer";
import { ProducerRepository } from "#/repositories/producer.repository";
import { ProducerService } from "#/services/producer.service";
import { loadProducers } from "#/services/producer-loader.service";
import { logger } from "#/utils/logger";

const producerRepository = new ProducerRepository();

producerRepository.register(new RenamerProducer());
producerRepository.register(new RemixTagProducer());
producerRepository.register(new RemoveRemixTagProducer());
producerRepository.register(new ArtistTagSeparatorProducer("split"));
producerRepository.register(new ArtistTagSeparatorProducer("combine"));

const loadedProducers = await loadProducers(config.producersDir);
for (const producer of loadedProducers.producers) {
  try {
    producerRepository.register(producer);
  } catch (error) {
    logger.error("Could not register user producer", {
      error,
      producer: producer.name,
    });
  }
}
for (const error of loadedProducers.errors) {
  logger.error("Could not load user producer", error);
}

const producerService = new ProducerService(producerRepository);

export { producerService };
