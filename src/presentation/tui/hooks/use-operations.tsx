import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { config } from "#/config";
import { filesystemService } from "#/containers/filesystem.container";
import { tagWriterService } from "#/containers/tag-writer.container";
import type { Operation } from "#/types/operation";
import { isRenameOperation, isTagUpdateOperation } from "#/utils/is-operation";
import { logger } from "#/utils/logger";
import { getOperationFolder } from "#/utils/operation-path";
import { isPathWithinRoot } from "#/utils/path";
import { settleInBatches } from "#/utils/settle-in-batches";

type OperationStatus = "accepted" | "rejected" | "modified";

type RenameModification = Partial<
  Pick<Extract<Operation, { type: "rename" }>, "newPath">
>;
type TagUpdateModification = Partial<
  Pick<Extract<Operation, { type: "tag-update" }>, "tags">
>;

type OperationState = {
  id: string;
  operation: Operation;
  status: OperationStatus;
  modifiedValue?: RenameModification | TagUpdateModification;
};

type UseOperationsReturn = {
  operations: OperationState[];
  setRawOperations: Dispatch<SetStateAction<Operation[]>>;
  selectedId: string | null;
  select: (id: string | null) => void;
  toggle: (id: string) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  acceptFolder: (folder: string) => void;
  rejectFolder: (folder: string) => void;
  modify: (
    id: string,
    value: RenameModification | TagUpdateModification,
  ) => void;
  getFolder: (id: string) => string;
  apply: (
    root: string,
  ) => Promise<{ errors: string[]; success: number; failed: number }>;
  stats: {
    total: number;
    accepted: number;
    rejected: number;
    modified: number;
  };
};

export function useOperations(): UseOperationsReturn {
  const [rawOperations, setRawOperations] = useState<Operation[]>([]);
  const [operations, setOperations] = useState<OperationState[]>(() =>
    rawOperations.map((op, i) => ({
      id: `${op.type}-${i}`,
      operation: op,
      status: "accepted" as const,
    })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setOperations(
      rawOperations.map((op, i) => ({
        id: `${op.type}-${i}`,
        operation: op,
        status: "accepted" as const,
      })),
    );
    setSelectedId(null);
  }, [rawOperations]);

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const toggle = useCallback((id: string) => {
    setOperations((prev) =>
      prev.map((op) =>
        op.id === id
          ? {
              ...op,
              status: op.status === "accepted" ? "rejected" : "accepted",
            }
          : op,
      ),
    );
  }, []);

  const acceptAll = useCallback(() => {
    setOperations((prev) =>
      prev.map((op) => ({ ...op, status: "accepted" as const })),
    );
  }, []);

  const rejectAll = useCallback(() => {
    setOperations((prev) =>
      prev.map((op) => ({ ...op, status: "rejected" as const })),
    );
  }, []);

  const acceptFolder = useCallback((folder: string) => {
    setOperations((prev) =>
      prev.map((op) =>
        getOperationFolder(op.operation) === folder
          ? { ...op, status: "accepted" as const }
          : op,
      ),
    );
  }, []);

  const rejectFolder = useCallback((folder: string) => {
    setOperations((prev) =>
      prev.map((op) =>
        getOperationFolder(op.operation) === folder
          ? { ...op, status: "rejected" as const }
          : op,
      ),
    );
  }, []);

  const modify = useCallback(
    (id: string, value: RenameModification | TagUpdateModification) => {
      setOperations((prev) =>
        prev.map((op) =>
          op.id === id
            ? { ...op, modifiedValue: value, status: "modified" as const }
            : op,
        ),
      );
    },
    [],
  );

  const getFolder = useCallback(
    (id: string) => {
      const op = operations.find((o) => o.id === id);
      if (!op) return "/";
      return getOperationFolder(op.operation);
    },
    [operations],
  );

  const apply = useCallback(
    async (root: string) => {
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      const renames: { old: string; new: string }[] = [];
      const tagUpdates: {
        path: string;
        tags: Record<string, string | number>;
      }[] = [];

      for (const op of operations) {
        if (op.status === "rejected") continue;

        if (isRenameOperation(op.operation)) {
          const base = op.operation;
          const modified =
            op.modifiedValue && "newPath" in op.modifiedValue
              ? (op.modifiedValue as RenameModification)
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
          } else {
            renames.push({ new: newPath, old: base.oldPath });
          }
        } else if (isTagUpdateOperation(op.operation)) {
          const base = op.operation;
          const modified =
            op.modifiedValue && "tags" in op.modifiedValue
              ? (op.modifiedValue as TagUpdateModification)
              : null;
          if (!isPathWithinRoot(root, base.path)) {
            failed++;
            errors.push(
              `Refusing tag update outside library root: ${base.path}`,
            );
            logger.error("Rejected tag update outside library root", {
              path: base.path,
              root,
            });
          } else {
            tagUpdates.push({
              path: base.path,
              tags: modified?.tags ?? base.tags,
            });
          }
        }
      }

      const renameResults = await settleInBatches(
        renames,
        config.filesystemConcurrency,
        (rename) => filesystemService.rename(rename.old, rename.new),
      );
      for (let index = 0; index < renameResults.length; index++) {
        const result = renameResults[index];
        if (!result) continue;
        if (result.status === "fulfilled") {
          success++;
        } else {
          const rename = renames[index];
          failed++;
          const message =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason);
          errors.push(`${rename?.old ?? "File"}: ${message}`);
          logger.error("File rename failed", {
            error: result.reason,
            newPath: rename?.new,
            oldPath: rename?.old,
          });
        }
      }

      if (tagUpdates.length > 0) {
        try {
          const result = await tagWriterService.updateTags(tagUpdates);
          success += result.success;
          failed += result.failed;
          errors.push(
            ...result.errors.map((item) => `${item.path}: ${item.error}`),
          );
        } catch (error) {
          failed += tagUpdates.length;
          const message =
            error instanceof Error ? error.message : String(error);
          errors.push(`Tag update batch failed: ${message}`);
          logger.error("Tag update batch failed", { error });
        }
      }

      return { errors, failed, success };
    },
    [operations],
  );

  const stats = useMemo(() => {
    let accepted = 0;
    let rejected = 0;
    let modified = 0;
    for (const op of operations) {
      if (op.status === "accepted") accepted++;
      else if (op.status === "rejected") rejected++;
      else if (op.status === "modified") modified++;
    }
    return { accepted, modified, rejected, total: operations.length };
  }, [operations]);

  return {
    acceptAll,
    acceptFolder,
    apply,
    getFolder,
    modify,
    operations,
    rejectAll,
    rejectFolder,
    select,
    selectedId,
    setRawOperations,
    stats,
    toggle,
  };
}

export type {
  OperationState,
  OperationStatus,
  RenameModification,
  TagUpdateModification,
  UseOperationsReturn,
};
