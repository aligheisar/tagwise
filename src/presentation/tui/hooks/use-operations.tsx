import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import type {
  OperationState,
  OperationStatus,
  RenameModification,
  TagUpdateModification,
} from "#/lib/operations/operation-state";
import {
  createOperationReviewState,
  getOperationStats,
  operationReviewReducer,
} from "#/lib/operations/operation-state";
import {
  type ApplyOperationsResult,
  applyReviewedOperations,
} from "#/services/operation-apply-workflow.service";
import type { Operation } from "#/types/operation";
import { getOperationFolder } from "#/utils/operation-path";

type UseOperationsReturn = {
  operations: OperationState[];
  setRawOperations: Dispatch<SetStateAction<Operation[]>>;
  selectedId: string | null;
  select: (id: string | null) => void;
  toggle: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  toggleGroup: (filePath: string) => void;
  moveGroup: (filePath: string, direction: -1 | 1) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  acceptFolder: (folder: string) => void;
  rejectFolder: (folder: string) => void;
  modify: (
    id: string,
    value: RenameModification | TagUpdateModification,
  ) => void;
  getFolder: (id: string) => string;
  apply: (root: string) => Promise<ApplyOperationsResult>;
  stats: {
    total: number;
    accepted: number;
    rejected: number;
    modified: number;
  };
};

export function useOperations(): UseOperationsReturn {
  const [rawOperations, setRawOperations] = useState<Operation[]>([]);
  const [reviewState, dispatch] = useReducer(
    operationReviewReducer,
    rawOperations,
    createOperationReviewState,
  );
  const { operations, selectedId } = reviewState;

  useEffect(() => {
    dispatch({ operations: rawOperations, type: "reset" });
  }, [rawOperations]);

  const select = useCallback((id: string | null) => {
    dispatch({ id, type: "select" });
  }, []);

  const toggle = useCallback((id: string) => {
    dispatch({ id, type: "toggle" });
  }, []);

  const move = useCallback((id: string, direction: -1 | 1) => {
    dispatch({ direction, id, type: "move" });
  }, []);

  const toggleGroup = useCallback((filePath: string) => {
    dispatch({ filePath, type: "toggle-group" });
  }, []);

  const moveGroup = useCallback((filePath: string, direction: -1 | 1) => {
    dispatch({ direction, filePath, type: "move-group" });
  }, []);

  const acceptAll = useCallback(() => {
    dispatch({ type: "accept-all" });
  }, []);

  const rejectAll = useCallback(() => {
    dispatch({ type: "reject-all" });
  }, []);

  const acceptFolder = useCallback((folder: string) => {
    dispatch({ folder, type: "accept-folder" });
  }, []);

  const rejectFolder = useCallback((folder: string) => {
    dispatch({ folder, type: "reject-folder" });
  }, []);

  const modify = useCallback(
    (id: string, value: RenameModification | TagUpdateModification) => {
      dispatch({ id, type: "modify", value });
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
    (root: string) => applyReviewedOperations(operations, root),
    [operations],
  );

  const stats = getOperationStats(operations);

  return {
    acceptAll,
    acceptFolder,
    apply,
    getFolder,
    modify,
    move,
    moveGroup,
    operations,
    rejectAll,
    rejectFolder,
    select,
    selectedId,
    setRawOperations,
    stats,
    toggle,
    toggleGroup,
  };
}

export type {
  OperationState,
  OperationStatus,
  RenameModification,
  TagUpdateModification,
  UseOperationsReturn,
};
