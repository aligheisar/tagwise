import { getOperationFolder } from "#/utils/operation-path";
import { TreeNode } from "@/components/tree-node";
import type { OperationState } from "@/hooks/use-operations";
import { colors } from "@/theme";

type TreeNodeData = {
  type: "folder";
  path: string;
  displayName: string;
  children: TreeNodeData[];
  leafChildren: LeafNodeData[];
};

type LeafNodeData = {
  type: "leaf";
  operation: OperationState;
};

type FlatNode =
  | { type: "folder"; node: TreeNodeData; depth: number }
  | { type: "leaf"; node: LeafNodeData; depth: number };

type TreeViewProps = {
  visibleNodes: FlatNode[];
  cursorIndex: number;
  expandedFolders: Set<string>;
};

export function TreeView({
  visibleNodes,
  cursorIndex,
  expandedFolders,
}: TreeViewProps) {
  return (
    <box flexDirection="column" flexGrow={1}>
      {visibleNodes.map((item, index) => {
        const isSelected = index === cursorIndex;
        const bgColor = isSelected ? colors.bgHighlight : undefined;
        const indent = "  ".repeat(item.depth);

        if (item.type === "leaf") {
          return (
            <TreeNode
              depth={item.depth}
              isSelected={isSelected}
              key={item.node.operation.id}
              operation={item.node.operation}
            />
          );
        }

        const node = item.node;
        const opCount = node.leafChildren.length;

        return (
          <box
            backgroundColor={bgColor}
            flexDirection="row"
            key={node.path}
            paddingX={1}
          >
            <text>
              <span fg={colors.muted}>{indent}</span>
              <span fg={colors.warning}>
                {expandedFolders.has(node.path) ? "▼ " : "▶ "}
              </span>
              <span fg={colors.accent}>{node.displayName}/</span>
              <span fg={colors.muted}>{` (${opCount} operations)`}</span>
            </text>
          </box>
        );
      })}
    </box>
  );
}

function buildTree(
  operations: OperationState[],
  libraryRoot: string,
): TreeNodeData[] {
  const root: TreeNodeData[] = [];
  const folderMap = new Map<string, TreeNodeData>();

  const normalizedRoot = libraryRoot.endsWith("/")
    ? libraryRoot.slice(0, -1)
    : libraryRoot;

  for (const op of operations) {
    const fullPath = getOperationFolder(op.operation);

    let relativePath = fullPath;
    if (normalizedRoot && fullPath.startsWith(normalizedRoot)) {
      relativePath = fullPath.slice(normalizedRoot.length) || "/";
    }

    const parts = relativePath.split("/").filter(Boolean);

    let currentFolders = root;
    let currentPath = normalizedRoot;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i] as string;
      currentPath += `/${part}`;

      let folder = folderMap.get(currentPath);
      if (!folder) {
        folder = {
          children: [],
          displayName: part,
          leafChildren: [],
          path: currentPath,
          type: "folder",
        };
        folderMap.set(currentPath, folder);
        currentFolders.push(folder);
      }
      currentFolders = folder.children;
    }

    const parentFolder = folderMap.get(currentPath);
    if (parentFolder) {
      parentFolder.leafChildren.push({ operation: op, type: "leaf" });
    }
  }

  return root;
}

function flattenVisible(
  nodes: TreeNodeData[],
  expandedFolders: Set<string>,
  depth: number,
): FlatNode[] {
  const result: FlatNode[] = [];

  for (const node of nodes) {
    result.push({ depth, node, type: "folder" });
    if (expandedFolders.has(node.path)) {
      result.push(...flattenVisible(node.children, expandedFolders, depth + 1));
      for (const leaf of node.leafChildren) {
        result.push({ depth: depth + 1, node: leaf, type: "leaf" });
      }
    }
  }

  return result;
}

function computeVisibleNodes(
  operations: OperationState[],
  expandedFolders: Set<string>,
  libraryRoot: string,
): FlatNode[] {
  const tree = buildTree(operations, libraryRoot);
  return flattenVisible(tree, expandedFolders, 0);
}

export type { FlatNode, LeafNodeData, TreeNodeData };
export { buildTree, computeVisibleNodes, flattenVisible };
