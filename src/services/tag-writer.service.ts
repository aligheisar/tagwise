import { updateFolderTags } from "taglib-wasm/folder";

const TAG_WRITE_CONCURRENCY = 8;

type TagUpdate = {
  path: string;
  tags: Record<string, string | number>;
};

class TagWriterService {
  async updateTags(updates: TagUpdate[]): Promise<void> {
    await updateFolderTags(
      updates.map((u) => ({ path: u.path, tags: u.tags })),
      { concurrency: TAG_WRITE_CONCURRENCY, continueOnError: true },
    );
  }
}

export type { TagUpdate };
export { TagWriterService };
