import type { Library } from "@/types/library";
import type { Operation } from "@/types/operation";

interface Producer {
  description?: string;
  name: string;
  produce(library: Library): Promise<Operation[]>;
  version?: string;
}

export type { Producer };
