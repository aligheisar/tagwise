import path from "node:path";
import {
  buildTree,
  type FlatNode,
  type TreeNodeData,
} from "#/lib/tree/tree-model";
import { type TreeNode as TermTreeNode, Tree } from "@/components/ui/tree";
import type { OperationState } from "@/hooks/use-operations";

type TreeViewProps = {
  visibleNodes: FlatNode[];
  cursorIndex: number;
  expandedFolders: Set<string>;
  operations: OperationState[];
  libraryRoot: string;
};

export function TreeView({
  visibleNodes,
  cursorIndex,
  expandedFolders,
  operations,
  libraryRoot,
}: TreeViewProps) {
  const tree = buildTree(operations, libraryRoot);
  const selectedNode = visibleNodes[cursorIndex];
  const activeKey = selectedNode
    ? selectedNode.type === "folder"
      ? selectedNode.node.path
      : selectedNode.node.group.id
    : undefined;

  return (
    <Tree
      activeKey={activeKey}
      expandedKeys={[...expandedFolders]}
      focused={false}
      nodes={tree.map(toTermTreeNode)}
    />
  );
}

function toTermTreeNode(folder: TreeNodeData): TermTreeNode {
  const children: TermTreeNode[] = [
    ...folder.children.map(toTermTreeNode),
    ...folder.leafChildren.map(({ group }) => ({
      icon: group.status === "rejected" ? "✗" : "♫",
      key: group.id,
      label: `#${String(group.order + 1).padStart(3, "0")} ${path.basename(group.filePath)} — ${group.operations.map(({ operation }) => operation.metadata?.producerName ?? operation.type).join(", ")} (${group.operations.length} operations)`,
    })),
  ];

  return {
    children,
    icon: "♪",
    key: folder.path,
    label: `${folder.displayName}/ (${folder.operationCount} operations)`,
  };
}
