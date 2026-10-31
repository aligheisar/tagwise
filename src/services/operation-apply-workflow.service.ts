import { filesystemService } from "#/containers/filesystem.container";
import { tagWriterService } from "#/containers/tag-writer.container";
import type { OperationState } from "#/lib/operations/operation-state";
import {
  type ApplyOperationsResult,
  applyOperations,
} from "#/services/operation-apply.service";

async function applyReviewedOperations(
  operations: OperationState[],
  root: string,
): Promise<ApplyOperationsResult> {
  return applyOperations(operations, root, {
    rename: (oldPath, newPath) => filesystemService.rename(oldPath, newPath),
    updateTags: (updates) => tagWriterService.updateTags(updates),
  });
}

export type { ApplyOperationsResult };
export { applyReviewedOperations };
