import type { ReadonlyLibrary } from "#/types/library";
import type { Operation } from "#/types/operation";

interface Producer {
  description?: string;
  name: string;
  produce(library: ReadonlyLibrary): Promise<Operation[]>;
  version?: string;
}

export type { Producer };
