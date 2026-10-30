import { updateFolderTags } from "taglib-wasm/folder";
import { config } from "#/config";
import { logger } from "#/utils/logger";

type TagUpdate = {
  path: string;
  tags: Record<string, string | number>;
};

type TagWriteError = {
  error: string;
  path: string;
};

type TagWriteResult = {
  errors: TagWriteError[];
  failed: number;
  success: number;
};

class TagWriterService {
  async updateTags(updates: TagUpdate[]): Promise<TagWriteResult> {
    let success = 0;
    let failed = 0;
    const errors: TagWriteError[] = [];

    for (
      let offset = 0;
      offset < updates.length;
      offset += config.tagWriteBatchSize
    ) {
      const batch = updates.slice(offset, offset + config.tagWriteBatchSize);
      const result = await updateFolderTags(
        batch.map((update) => ({ path: update.path, tags: update.tags })),
        {
          concurrency: config.tagWriteConcurrency,
          continueOnError: true,
        },
      );

      for (const item of result.items) {
        if (item.status === "ok") {
          success++;
        } else {
          failed++;
          errors.push({ error: item.error.message, path: item.path });
          logger.error("Tag update failed", {
            error: item.error,
            path: item.path,
          });
        }
      }
    }

    return { errors, failed, success };
  }
}

export type { TagUpdate, TagWriteError, TagWriteResult };
export { TagWriterService };
