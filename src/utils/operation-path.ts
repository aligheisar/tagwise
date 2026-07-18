import path from "node:path";
import type { Operation } from "@/types/operation";
import { isRenameOperation, isTagUpdateOperation } from "@/utils/is-operation";

function getOperationPath(op: Operation): string {
  if (isRenameOperation(op)) return op.oldPath;
  if (isTagUpdateOperation(op)) return op.path;
  return "";
}

function getOperationFolder(op: Operation): string {
  const filePath = getOperationPath(op);
  if (!filePath) return "";
  const dir = path.dirname(filePath);
  return dir === "." ? "/" : dir;
}

function getOperationFilename(op: Operation): string {
  const filePath = getOperationPath(op);
  if (!filePath) return "";
  return path.basename(filePath);
}

export { getOperationFilename, getOperationFolder };
