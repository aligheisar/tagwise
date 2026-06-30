import sanitize from "sanitize-filename";
import type { Library } from "@/domain/media-item/entity";
import type { Operation } from "@/domain/operation/entity";
import type { Producer } from "@/domain/producer/entity";

export class RemixTagProducer implements Producer {
  produce(library: Library): Promise<Operation[]> {
    const operations: Operation[] = [];

    for (const item of library.items) {
      if (item.status === "error") continue;
      if (!item.tags.title?.[0]?.trim()) continue;
      if (item.tags.title[0].endsWith(" (Remix)")) continue;

      operations.push({
        path: item.path,
        tags: { title: `${sanitize(item.tags.title[0].trim())} (Remix)` },
        type: "tag-update",
      });
    }

    return Promise.resolve(operations);
  }
}
