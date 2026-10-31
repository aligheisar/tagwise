import type {
  OperationState,
  RenameModification,
  TagUpdateModification,
} from "#/lib/operations/operation-state";
import { isRenameOperation, isTagUpdateOperation } from "#/utils/is-operation";
import { logger } from "#/utils/logger";
import { isPathWithinRoot } from "#/utils/path";
import type { TagUpdate, TagWriteResult } from "./tag-writer.service";

type ApplyOperationsResult = {
  errors: string[];
  success: number;
  failed: number;
};

type ApplyOperationsDependencies = {
  rename: (oldPath: string, newPath: string) => Promise<void>;
  updateTags: (updates: TagUpdate[]) => Promise<TagWriteResult>;
};

async function applyOperations(
  operations: OperationState[],
  root: string,
  dependencies: ApplyOperationsDependencies,
): Promise<ApplyOperationsResult> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  const validatedOperations: (
    | { type: "rename"; oldPath: string; newPath: string }
    | { type: "tag-update"; update: TagUpdate }
  )[] = [];
  const seenRenameTargets = new Set<string>();

  for (const operation of operations) {
    if (operation.status === "rejected") continue;

    if (isRenameOperation(operation.operation)) {
      const base = operation.operation;
      const modified =
        operation.modifiedValue && "newPath" in operation.modifiedValue
          ? (operation.modifiedValue as RenameModification)
          : null;
      const newPath = modified?.newPath ?? base.newPath;
      if (
        !isPathWithinRoot(root, base.oldPath) ||
        !isPathWithinRoot(root, newPath)
      ) {
        failed++;
        errors.push(`Refusing rename outside library root: ${newPath}`);
        logger.error("Rejected rename outside library root", {
          newPath,
          oldPath: base.oldPath,
          root,
        });
        continue;
      }

      if (seenRenameTargets.has(newPath)) {
        failed++;
        errors.push(`Duplicate rename target: ${newPath}`);
        logger.error("Duplicate rename target detected", {
          newPath,
          oldPath: base.oldPath,
          root,
        });
        continue;
      }

      seenRenameTargets.add(newPath);
      validatedOperations.push({
        newPath,
        oldPath: base.oldPath,
        type: "rename",
      });
    } else if (isTagUpdateOperation(operation.operation)) {
      const base = operation.operation;
      const modified =
        operation.modifiedValue && "tags" in operation.modifiedValue
          ? (operation.modifiedValue as TagUpdateModification)
          : null;
      if (!isPathWithinRoot(root, base.path)) {
        failed++;
        errors.push(`Refusing tag update outside library root: ${base.path}`);
        logger.error("Rejected tag update outside library root", {
          path: base.path,
          root,
        });
      } else {
        validatedOperations.push({
          type: "tag-update",
          update: { path: base.path, tags: modified?.tags ?? base.tags },
        });
      }
    } else {
      failed++;
      errors.push(`Unsupported operation type: ${operation.operation.type}`);
      logger.error("Unsupported operation type", {
        operationId: operation.operation.id,
        type: operation.operation.type,
      });
    }
  }

  for (const operation of validatedOperations) {
    if (operation.type === "rename") {
      try {
        await dependencies.rename(operation.oldPath, operation.newPath);
        success++;
      } catch (error) {
        failed++;
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${operation.oldPath}: ${message}`);
        logger.error("File rename failed", {
          error,
          newPath: operation.newPath,
          oldPath: operation.oldPath,
        });
      }
      continue;
    }

    try {
      const result = await dependencies.updateTags([operation.update]);
      success += result.success;
      failed += result.failed;
      errors.push(
        ...result.errors.map((item) => `${item.path}: ${item.error}`),
      );
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Tag update batch failed: ${message}`);
      logger.error("Tag update batch failed", { error });
    }
  }

  return { errors, failed, success };
}

export type { ApplyOperationsDependencies, ApplyOperationsResult };
export { applyOperations };
