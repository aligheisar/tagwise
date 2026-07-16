import type { Library } from "@/types/library";

type Operation =
  | { type: "rename"; oldPath: string; newPath: string }
  | { type: "tag-update"; path: string; tags: Record<string, string | number> };

interface Producer {
  produce(library: Library): Promise<Operation[]>;
}

export type { Operation, Producer };
