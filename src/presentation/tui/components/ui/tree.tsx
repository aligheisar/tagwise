import { useKeyboard } from "@opentui/react";
import { useMemo, useState } from "react";

import { useTheme } from "@/hooks/use-theme";

export interface TreeFile {
  icon?: string;
  index: string;
  key: string;
  producers: string[];
  title: string;
  type: "File";
}

export type TreeNode = TreeFolder | TreeFile;

interface TreeFolder {
  children: (TreeFile | TreeFolder)[];
  icon?: string;
  key: string;
  operationCount: number;
  title: string;
  type: "Folder";
}

export interface TreeProps {
  activeKey?: string;
  collapsedIcon?: string;
  defaultExpanded?: string[];
  expandedIcon?: string;
  expandedKeys?: string[];
  focused?: boolean;
  leafIcon?: string;
  nodes: TreeNode[];
  onExpandedChange?: (keys: string[]) => void;
  onSelect?: (node: TreeNode) => void;
}

interface FlatNode {
  depth: number;
  hasChildren: boolean;
  node: TreeNode;
}

const flattenTree = (
  nodes: TreeNode[],
  expandedKeys: Set<string>,
  depth = 0,
): FlatNode[] => {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    const hasChildren = Boolean(
      node.type === "Folder" && node.children.length > 0,
    );
    result.push({ depth, hasChildren, node });
    if (hasChildren && expandedKeys.has(node.key)) {
      const childFlat = flattenTree(
        node.type === "Folder" ? node.children : [],
        expandedKeys,
        depth + 1,
      );
      result.push(...childFlat);
    }
  }
  return result;
};

export const Tree = ({
  nodes,
  onSelect,
  activeKey,
  defaultExpanded = [],
  expandedKeys: controlledExpandedKeys,
  onExpandedChange,
  focused = true,
  expandedIcon = "▼",
  collapsedIcon = "▶",
  leafIcon = "•",
}: TreeProps) => {
  const theme = useTheme();
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(
    new Set(defaultExpanded),
  );
  const expandedKeys = useMemo(
    () => new Set(controlledExpandedKeys ?? internalExpandedKeys),
    [controlledExpandedKeys, internalExpandedKeys],
  );
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);

  const flatNodes = useMemo(
    () => flattenTree(nodes, expandedKeys),
    [nodes, expandedKeys],
  );
  const controlledActiveIndex = activeKey
    ? flatNodes.findIndex(({ node }) => node.key === activeKey)
    : -1;
  const activeIndex =
    controlledActiveIndex >= 0 ? controlledActiveIndex : internalActiveIndex;

  const updateExpandedKeys = (update: (keys: Set<string>) => Set<string>) => {
    const next = update(expandedKeys);
    if (controlledExpandedKeys === undefined) setInternalExpandedKeys(next);
    onExpandedChange?.([...next]);
  };

  useKeyboard((key) => {
    if (!focused) return;
    const current = flatNodes[activeIndex];
    if (key.name === "up") {
      setInternalActiveIndex((i) => Math.max(0, i - 1));
    } else if (key.name === "down") {
      setInternalActiveIndex((i) => Math.min(flatNodes.length - 1, i + 1));
    } else if (key.name === "right" || key.name === "space") {
      if (current?.hasChildren && !expandedKeys.has(current.node.key)) {
        updateExpandedKeys((prev) => new Set([...prev, current.node.key]));
      }
    } else if (key.name === "left") {
      if (current?.hasChildren && expandedKeys.has(current.node.key)) {
        updateExpandedKeys((prev) => {
          const next = new Set(prev);
          next.delete(current.node.key);
          return next;
        });
      }
    } else if (key.name === "return" && current) {
      onSelect?.(current.node);
    }
  });

  return (
    <box flexDirection="column">
      {flatNodes.map(({ node, depth, hasChildren }, idx) => {
        const isActive = idx === activeIndex;
        const isExpanded = expandedKeys.has(node.key);
        const prefix = "  ".repeat(depth);
        let indicator: string;
        if (hasChildren) {
          indicator = isExpanded ? expandedIcon : collapsedIcon;
        } else {
          indicator = node.icon ?? leafIcon;
        }
        return (
          <box flexDirection="row" key={node.key}>
            <text>{prefix}</text>
            <text
              fg={
                isActive ? theme.colors.primary : theme.colors.mutedForeground
              }
            >{`${indicator} `}</text>
            <text bg={isActive ? theme.colors.primary : "transparent"}>
              {node.type === "Folder" ? (
                <>
                  <span fg={theme.colors.foreground}>{node.title}</span>{" "}
                  <span fg={theme.colors.muted}>({node.operationCount})</span>
                </>
              ) : (
                <>
                  <span fg={theme.colors.foreground}>{node.title}</span>
                  {" - "}
                  <span fg={theme.colors.muted}>
                    {node.producers.length > 2
                      ? [...node.producers.slice(0, 2), "..."].join(", ")
                      : node.producers.join(", ")}
                  </span>{" "}
                  <span fg={theme.colors.primary}>{node.index}</span>
                </>
              )}
            </text>
          </box>
        );
      })}
    </box>
  );
};
