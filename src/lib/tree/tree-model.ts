import path from "node:path";
import type {
  FileOperationGroup,
  OperationState,
} from "#/lib/operations/operation-state";
import { getFileOperationGroups } from "#/lib/operations/operation-state";

export type TreeNodeData = {
  type: "folder";
  path: string;
  displayName: string;
  children: TreeNodeData[];
  leafChildren: LeafNodeData[];
  operationCount: number;
};

export type LeafNodeData = {
  type: "leaf";
  group: FileOperationGroup;
};

export type FlatNode =
  | { type: "folder"; node: TreeNodeData; depth: number }
  | { type: "leaf"; node: LeafNodeData; depth: number };

function buildTree(
  operations: OperationState[],
  libraryRoot: string,
): TreeNodeData[] {
  const normalizedRoot = libraryRoot.endsWith("/")
    ? libraryRoot.slice(0, -1)
    : libraryRoot;

  const rootFolder: TreeNodeData = {
    children: [],
    displayName: normalizedRoot
      ? (normalizedRoot.split("/").filter(Boolean).at(-1) ?? "/")
      : "/",
    leafChildren: [],
    operationCount: 0,
    path: normalizedRoot,
    type: "folder",
  };

  const root: TreeNodeData[] = [rootFolder];
  const folderMap = new Map<string, TreeNodeData>([
    [normalizedRoot, rootFolder],
  ]);

  for (const group of getFileOperationGroups(operations)) {
    const firstOperation = group.operations[0]?.operation;
    if (!firstOperation) continue;
    const groupFolder = path.dirname(group.filePath);

    let relativePath = groupFolder;
    if (normalizedRoot && groupFolder.startsWith(normalizedRoot)) {
      relativePath = groupFolder.slice(normalizedRoot.length) || "/";
    }

    const parts = relativePath.split("/").filter(Boolean);

    let currentFolders = rootFolder.children;
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
          operationCount: 0,
          path: currentPath,
          type: "folder",
        };
        folderMap.set(currentPath, folder);
        currentFolders.push(folder);
      }
      currentFolders = folder.children;
    }

    const parentFolder = folderMap.get(currentPath) ?? rootFolder;
    parentFolder.leafChildren.push({ group, type: "leaf" });
  }

  return root.filter(pruneEmptyFolders);
}

function pruneEmptyFolders(folder: TreeNodeData): boolean {
  folder.children = folder.children.filter(pruneEmptyFolders);
  folder.operationCount =
    folder.leafChildren.reduce(
      (count, leaf) => count + leaf.group.operations.length,
      0,
    ) +
    folder.children.reduce((count, child) => count + child.operationCount, 0);
  return folder.operationCount > 0;
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

export { buildTree, computeVisibleNodes, flattenVisible };
