import sanitize from "sanitize-filename";
import type { Library } from "@/types/library";
import type { Operation } from "@/types/operation";
import type { Producer } from "@/types/producer";

export class RemixTagProducer implements Producer {
  name = "remix-tag";

  produce(library: Library): Promise<Operation[]> {
    const operations: Operation[] = [];

    for (const item of library.items) {
      if (item.status === "error") continue;
      if (!item.tags.title?.[0]?.trim()) continue;
      if (item.tags.title[0].endsWith(" (Remix)")) continue;

      operations.push({
        id: `${this.name}-${item.path}`,
        path: item.path,
        tags: { title: `${sanitize(item.tags.title[0].trim())} (Remix)` },
        type: "tag-update",
      });
    }

    return Promise.resolve(operations);
  }
}
