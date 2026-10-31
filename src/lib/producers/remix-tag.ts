import type { Library } from "#/types/library";
import type { Operation } from "#/types/operation";
import type { Producer } from "#/types/producer";

export class RemixTagProducer implements Producer {
  name = "remix-tag";
  description = "Add ' (Remix)' at the end of title.";

  produce(library: Library): Promise<Operation[]> {
    const operations: Operation[] = [];

    for (const item of library.items) {
      if (item.status === "error") continue;

      const title = item.tags.title?.[0]?.trim();
      if (!title || title.endsWith(" (Remix)")) continue;

      operations.push({
        id: `${this.name}-${item.path}`,
        path: item.path,
        tags: { title: `${title} (Remix)` },
        type: "tag-update",
      });
    }

    return Promise.resolve(operations);
  }
}
