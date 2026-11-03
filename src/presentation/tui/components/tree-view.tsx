import path from "node:path";
import {
  buildTree,
  type FlatNode,
  type TreeNodeData,
} from "#/lib/tree/tree-model";
import { useLibraries } from "#/presentation/tui/hooks/use-libraries";
import type { Library } from "#/types/library";
import { type TreeNode as TermTreeNode, Tree } from "@/components/ui/tree";
import type { OperationState } from "@/hooks/use-operations";

interface TreeViewProps {
  cursorIndex: number;
  expandedFolders: Set<string>;
  libraryRoot: string;
  operations: OperationState[];
  visibleNodes: FlatNode[];
}

export function TreeView({
  visibleNodes,
  cursorIndex,
  expandedFolders,
  operations,
  libraryRoot,
}: TreeViewProps) {
  const { currentLibrary: library } = useLibraries();
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
      nodes={tree.map((node) => toTermTreeNode(node, library))}
    />
  );
}

function toTermTreeNode(
  folder: TreeNodeData,
  library: Library | null,
): TermTreeNode {
  const children: TermTreeNode[] = [
    ...folder.children.map((node) => toTermTreeNode(node, library)),
    ...folder.leafChildren.map(({ group }) => {
      const item = library?.items.find(
        (i) => i.path === group.filePath && i.status === "ok",
      );
      const title =
        item?.status === "ok" && item.tags.title?.[0]
          ? item.tags.title[0]
          : path.basename(group.filePath);
      const producers = group.operations.map(
        ({ operation }) => operation.metadata?.producerName ?? operation.type,
      );
      const index = `#${String(group.order + 1).padStart(3, "0")}`;

      return {
        icon: group.status === "rejected" ? "✗" : "♫",
        key: group.id,
        label: `${title} — ${producers.join(", ")} (${index})`,
      };
    }),
  ];

  return {
    children,
    icon: "♪",
    key: folder.path,
    label: `${folder.displayName}/ (${folder.operationCount} operations)`,
  };
}
