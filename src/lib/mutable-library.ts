import type { FolderScanItem } from "taglib-wasm";
import type { Library, ReadonlyLibrary } from "#/types/library";
import type { Operation } from "#/types/operation";

function cloneItems(items: FolderScanItem[]): FolderScanItem[] {
  return items.map((item) => {
    if (item.status !== "ok") return { ...item };

    return {
      ...item,
      tags: Object.fromEntries(
        Object.entries(item.tags).map(([key, value]) => [
          key,
          Array.isArray(value) ? [...value] : value,
        ]),
      ),
    };
  });
}

class MutableLibrary implements Library {
  items: FolderScanItem[];
  root: string;
  cachedAt: Date;

  constructor(library: Library) {
    this.items = cloneItems(library.items);
    this.root = library.root;
    this.cachedAt = library.cachedAt;
  }

  snapshot(): ReadonlyLibrary {
    return {
      cachedAt: new Date(this.cachedAt),
      items: cloneItems(this.items),
      root: this.root,
    };
  }

  applyOperation(op: Operation): void {
    if (op.type === "tag-update") {
      const item = this.items.find(
        (i) => i.path === op.path && i.status === "ok",
      );
      if (item?.status !== "ok") {
        throw new Error(`Tag update target not found in preview: ${op.path}`);
      }
      const index = this.items.indexOf(item);
      this.items[index] = {
        ...item,
        tags: {
          ...item.tags,
          ...Object.fromEntries(
            Object.entries(op.tags).map(([k, v]) => [
              k,
              Array.isArray(v) ? [...v] : typeof v === "number" ? v : [v],
            ]),
          ),
        },
      };
    } else if (op.type === "rename") {
      const item = this.items.find(
        (i) => i.path === op.oldPath && i.status === "ok",
      );
      if (item?.status !== "ok") {
        throw new Error(`Rename source not found in preview: ${op.oldPath}`);
      }
      const target = this.items.find(
        (candidate) => candidate.path === op.newPath && candidate !== item,
      );
      if (target) {
        throw new Error(
          `Rename target already exists in preview: ${op.newPath}`,
        );
      }
      const index = this.items.indexOf(item);
      this.items[index] = { ...item, path: op.newPath };
    } else {
      throw new Error(`Unsupported operation type in preview: ${op.type}`);
    }
  }
}

export { MutableLibrary };
