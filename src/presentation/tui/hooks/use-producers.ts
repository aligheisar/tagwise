import { useMemo } from "react";
import { producerService } from "#/containers/producer.container";
import type { Producer } from "#/types/producer";

function useProducers(): Producer[] {
  return useMemo(() => producerService.getAll(), []);
}

export { useProducers };
