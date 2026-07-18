interface BaseOperation {
  id: string;
  metadata?: Record<string, unknown>;
}

interface RenameOperation extends BaseOperation {
  description?: string;
  newPath: string;
  oldPath: string;
  type: "rename";
}

interface TagUpdateOperation extends BaseOperation {
  description?: string;
  path: string;
  tags: Record<string, string | number>;
  type: "tag-update";
}

interface CustomOperation extends BaseOperation {
  description?: string;
  payload: Record<string, unknown>;
  type: "custom";
}

type Operation = RenameOperation | TagUpdateOperation | CustomOperation;

export type { CustomOperation, Operation, RenameOperation, TagUpdateOperation };
