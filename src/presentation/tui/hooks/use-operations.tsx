import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { filesystemService } from "@/containers/filesystem.container";
import { tagWriterService } from "@/containers/tag-writer.container";
import type { Operation } from "@/types/operation";
import { isRenameOperation, isTagUpdateOperation } from "@/utils/is-operation";

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
  apply: () => Promise<{ success: number; failed: number }>;
  stats: {
    total: number;
    accepted: number;
    rejected: number;
    modified: number;
  };
};

function getOperationFolder(op: Operation): string {
  if (isRenameOperation(op)) {
    const parts = op.oldPath.split("/");
    parts.pop();
    return parts.join("/") || "/";
  } else if (isTagUpdateOperation(op)) {
    const parts = op.path.split("/");
    parts.pop();
    return parts.join("/") || "/";
  }

  return "";
}

function getOperationFilename(op: Operation): string {
  if (isRenameOperation(op)) {
    return op.oldPath.split("/").pop() ?? "";
  } else if (isTagUpdateOperation(op)) {
    return op.path.split("/").pop() ?? "";
  }

  return "";
}

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

  const apply = useCallback(async () => {
    let success = 0;
    let failed = 0;

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
        renames.push({
          new: modified?.newPath ?? base.newPath,
          old: base.oldPath,
        });
      } else if (isTagUpdateOperation(op.operation)) {
        const base = op.operation;
        const modified =
          op.modifiedValue && "tags" in op.modifiedValue
            ? (op.modifiedValue as TagUpdateModification)
            : null;
        tagUpdates.push({
          path: base.path,
          tags: modified?.tags ?? base.tags,
        });
      }
    }

    for (const r of renames) {
      try {
        await filesystemService.rename(r.old, r.new);
        success++;
      } catch {
        failed++;
      }
    }

    if (tagUpdates.length > 0) {
      try {
        await tagWriterService.updateTags(tagUpdates);
        success += tagUpdates.length;
      } catch {
        failed += tagUpdates.length;
      }
    }

    return { failed, success };
  }, [operations]);

  const stats = useMemo(() => {
    const total = operations.length;
    const accepted = operations.filter((o) => o.status === "accepted").length;
    const rejected = operations.filter((o) => o.status === "rejected").length;
    const modified = operations.filter((o) => o.status === "modified").length;
    return { accepted, modified, rejected, total };
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

export {
  getOperationFilename,
  getOperationFolder,
  type OperationState,
  type OperationStatus,
  type RenameModification,
  type TagUpdateModification,
  type UseOperationsReturn,
};
