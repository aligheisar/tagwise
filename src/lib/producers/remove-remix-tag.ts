import type { Library } from "#/types/library";
import type { Operation } from "#/types/operation";
import type { Producer } from "#/types/producer";

export class RemoveRemixTagProducer implements Producer {
  name = "remove-remix-tag";
  description = "Remove ' (Remix)' at the end of title.";

  produce(library: Library): Promise<Operation[]> {
    const operations: Operation[] = [];

    for (const item of library.items) {
      if (item.status === "error") continue;

      const title = item.tags.title?.[0]?.trim();
      if (!title?.endsWith(" (Remix)")) continue;

      const updatedTitle = title.replace(/ \(Remix\)$/, "").trim();
      if (!updatedTitle) continue;

      operations.push({
        id: `${this.name}-${item.path}`,
        path: item.path,
        tags: {
          title: updatedTitle,
        },
        type: "tag-update",
      });
    }

    return Promise.resolve(operations);
  }
}
