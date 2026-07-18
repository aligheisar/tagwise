import type {
  Operation,
  RenameOperation,
  TagUpdateOperation,
} from "@/types/operation";

const isRenameOperation = (
  operation: Operation,
): operation is RenameOperation => {
  return operation.type === "rename";
};

const isTagUpdateOperation = (
  operation: Operation,
): operation is TagUpdateOperation => {
  return operation.type === "tag-update";
};

export { isRenameOperation, isTagUpdateOperation };
