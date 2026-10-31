import type { Operation } from "#/types/operation";
import { getOperationFolder } from "#/utils/operation-path";

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

type OperationReviewState = {
  operations: OperationState[];
  selectedId: string | null;
};

type FileOperationGroup = {
  filePath: string;
  id: string;
  operations: OperationState[];
  order: number;
  status: OperationStatus;
};

type OperationReviewAction =
  | { type: "reset"; operations: Operation[] }
  | { type: "select"; id: string | null }
  | { type: "toggle"; id: string }
  | { type: "move"; id: string; direction: -1 | 1 }
  | { type: "toggle-group"; filePath: string }
  | { type: "move-group"; filePath: string; direction: -1 | 1 }
  | { type: "accept-all" }
  | { type: "reject-all" }
  | { type: "accept-folder"; folder: string }
  | { type: "reject-folder"; folder: string }
  | {
      type: "modify";
      id: string;
      value: RenameModification | TagUpdateModification;
    };

type OperationStats = {
  total: number;
  accepted: number;
  rejected: number;
  modified: number;
};

function createOperationReviewState(
  operations: Operation[],
): OperationReviewState {
  return {
    operations: operations.map((operation, index) => ({
      id: `${operation.type}-${index}`,
      operation,
      status: "accepted",
    })),
    selectedId: null,
  };
}

function getOperationFilePath(operation: Operation): string {
  const filePath = operation.metadata?.filePath;
  if (typeof filePath === "string") return filePath;
  if (operation.type === "rename") return operation.oldPath;
  if (operation.type === "tag-update") return operation.path;
  return operation.id;
}

function getFileOperationGroups(
  operations: OperationState[],
): FileOperationGroup[] {
  const groups = new Map<string, FileOperationGroup>();

  for (const [order, operation] of operations.entries()) {
    const filePath = getOperationFilePath(operation.operation);
    let group = groups.get(filePath);
    if (!group) {
      group = {
        filePath,
        id: filePath,
        operations: [],
        order,
        status: operation.status,
      };
      groups.set(filePath, group);
    }
    group.operations.push(operation);
  }

  return [...groups.values()].map((group, order) => ({
    ...group,
    order,
    status: getGroupStatus(group.operations),
  }));
}

function getGroupStatus(operations: OperationState[]): OperationStatus {
  if (operations.every((operation) => operation.status === "rejected")) {
    return "rejected";
  }
  if (operations.some((operation) => operation.status === "modified")) {
    return "modified";
  }
  return "accepted";
}

function operationReviewReducer(
  state: OperationReviewState,
  action: OperationReviewAction,
): OperationReviewState {
  switch (action.type) {
    case "reset":
      return createOperationReviewState(action.operations);
    case "select":
      return { ...state, selectedId: action.id };
    case "toggle":
      return {
        ...state,
        operations: state.operations.map((operation) =>
          operation.id === action.id
            ? {
                ...operation,
                status:
                  operation.status === "accepted" ? "rejected" : "accepted",
              }
            : operation,
        ),
      };
    case "move": {
      const currentIndex = state.operations.findIndex(
        (operation) => operation.id === action.id,
      );
      const targetIndex = currentIndex + action.direction;
      if (
        currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= state.operations.length
      ) {
        return state;
      }

      const operations = [...state.operations];
      [operations[currentIndex], operations[targetIndex]] = [
        operations[targetIndex] as OperationState,
        operations[currentIndex] as OperationState,
      ];
      return { ...state, operations };
    }
    case "toggle-group": {
      const group = state.operations.filter(
        (operation) =>
          getOperationFilePath(operation.operation) === action.filePath,
      );
      const status = group.every((operation) => operation.status === "rejected")
        ? "accepted"
        : "rejected";
      return {
        ...state,
        operations: state.operations.map((operation) =>
          getOperationFilePath(operation.operation) === action.filePath
            ? { ...operation, status }
            : operation,
        ),
      };
    }
    case "move-group": {
      const groups = getFileOperationGroups(state.operations);
      const currentIndex = groups.findIndex(
        (group) => group.filePath === action.filePath,
      );
      const targetIndex = currentIndex + action.direction;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= groups.length) {
        return state;
      }

      [groups[currentIndex], groups[targetIndex]] = [
        groups[targetIndex] as FileOperationGroup,
        groups[currentIndex] as FileOperationGroup,
      ];
      return {
        ...state,
        operations: groups.flatMap((group) => group.operations),
      };
    }
    case "accept-all":
      return {
        ...state,
        operations: state.operations.map((operation) => ({
          ...operation,
          status: "accepted",
        })),
      };
    case "reject-all":
      return {
        ...state,
        operations: state.operations.map((operation) => ({
          ...operation,
          status: "rejected",
        })),
      };
    case "accept-folder":
    case "reject-folder": {
      const status = action.type === "accept-folder" ? "accepted" : "rejected";
      return {
        ...state,
        operations: state.operations.map((operation) =>
          getOperationFolder(operation.operation) === action.folder
            ? { ...operation, status }
            : operation,
        ),
      };
    }
    case "modify":
      return {
        ...state,
        operations: state.operations.map((operation) =>
          operation.id === action.id
            ? {
                ...operation,
                modifiedValue: action.value,
                status: "modified",
              }
            : operation,
        ),
      };
  }
}

function getOperationStats(operations: OperationState[]): OperationStats {
  let accepted = 0;
  let rejected = 0;
  let modified = 0;

  for (const operation of operations) {
    if (operation.status === "accepted") accepted++;
    else if (operation.status === "rejected") rejected++;
    else modified++;
  }

  return { accepted, modified, rejected, total: operations.length };
}

export type {
  FileOperationGroup,
  OperationReviewAction,
  OperationReviewState,
  OperationState,
  OperationStats,
  OperationStatus,
  RenameModification,
  TagUpdateModification,
};
export {
  createOperationReviewState,
  getFileOperationGroups,
  getOperationStats,
  operationReviewReducer,
};
