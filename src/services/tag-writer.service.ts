import { updateFolderTags } from "taglib-wasm/folder";

type TagUpdate = {
  path: string;
  tags: Record<string, string | number>;
};

class TagWriterService {
  async updateTags(updates: TagUpdate[]): Promise<void> {
    await updateFolderTags(
      updates.map((u) => ({ path: u.path, tags: u.tags })),
      { concurrency: 8, continueOnError: true },
    );
  }
}

export type { TagUpdate };
export { TagWriterService };
