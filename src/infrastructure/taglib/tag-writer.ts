import { updateFolderTags } from "taglib-wasm/folder";
import type { TagUpdate, TagWriterPort } from "@/domain/shared/ports";

export class TaglibTagWriter implements TagWriterPort {
  async updateTags(updates: TagUpdate[]) {
    await updateFolderTags(
      updates.map((u) => ({ path: u.path, tags: u.tags })),
      { concurrency: 8, continueOnError: true },
    );
  }
}
