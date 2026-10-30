import type { FolderScanItem } from "taglib-wasm";
import type { Library } from "#/types/library";
import type { Operation } from "#/types/operation";

class MutableLibrary implements Library {
  items: FolderScanItem[];
  root: string;
  cachedAt: Date;

  constructor(library: Library) {
    this.items = [...library.items];
    this.root = library.root;
    this.cachedAt = library.cachedAt;
  }

  applyOperation(op: Operation): void {
    if (op.type === "tag-update") {
      const item = this.items.find(
        (i) => i.path === op.path && i.status === "ok",
      );
      if (item?.status !== "ok") return;
      const index = this.items.indexOf(item);
      this.items[index] = {
        ...item,
        tags: {
          ...item.tags,
          ...Object.fromEntries(
            Object.entries(op.tags).map(([k, v]) => [
              k,
              Array.isArray(v) ? v : [v],
            ]),
          ),
        },
      };
    } else if (op.type === "rename") {
      const item = this.items.find(
        (i) => i.path === op.oldPath && i.status === "ok",
      );
      if (item?.status !== "ok") return;
      const index = this.items.indexOf(item);
      this.items[index] = { ...item, path: op.newPath };
    }
  }
}

export { MutableLibrary };
