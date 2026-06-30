import type { Library } from "@/domain/media-item/entity";
import type { Operation } from "@/domain/operation/entity";

interface Producer {
  produce(library: Library): Promise<Operation[]>;
}

export type { Producer };
