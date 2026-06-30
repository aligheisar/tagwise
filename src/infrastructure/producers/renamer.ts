import path from "node:path";
import sanitize from "sanitize-filename";
import type { Library } from "@/domain/media-item/entity";
import type { Operation } from "@/domain/operation/entity";
import type { Producer } from "@/domain/producer/entity";

export class RenamerProducer implements Producer {
  produce(library: Library): Promise<Operation[]> {
    const operations: Operation[] = [];

    for (const item of library.items) {
      if (item.status === "error") continue;
      if (!item.tags.title?.[0]) continue;

      const title = sanitize(item.tags.title[0].trim());
      const baseName = path.parse(item.path).name;
      if (title === baseName) continue;

      operations.push({
        newPath: path.join(
          path.dirname(item.path),
          title + path.extname(item.path),
        ),
        oldPath: item.path,
        type: "rename",
      });
    }

    return Promise.resolve(operations);
  }
}
