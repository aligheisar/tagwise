import { useKeyboard, useRenderer } from "@opentui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DetailModal } from "#/components/detail-modal";
import { HelpOverlay } from "#/components/help-overlay";
import { StatusBar } from "#/components/status-bar";
import type { FlatNode } from "#/components/tree-view";
import { computeVisibleNodes, TreeView } from "#/components/tree-view";
import type {
  OperationState,
  RenameModification,
  TagUpdateModification,
} from "#/hooks/use-operations";
import { getOperationFolder } from "#/hooks/use-operations";
import { useVimNav } from "#/hooks/use-vim-nav";

type ReviewScreenProps = {
  operations: OperationState[];
  libraryRoot: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onToggle: (id: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onAcceptFolder: (folder: string) => void;
  onRejectFolder: (folder: string) => void;
  onModify: (
    id: string,
    value: RenameModification | TagUpdateModification,
  ) => void;
  onApply: () => void;
  stats: {
    total: number;
    accepted: number;
    rejected: number;
    modified: number;
  };
};

export function ReviewScreen({
  operations,
  libraryRoot,
  selectedId,
  onSelect,
  onToggle,
  onAcceptAll,
  onRejectAll,
  onAcceptFolder,
  onRejectFolder,
  onApply: _onApply,
  stats,
}: ReviewScreenProps) {
  const renderer = useRenderer();
  const [showHelp, setShowHelp] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  const visibleNodes: FlatNode[] = useMemo(
    () => computeVisibleNodes(operations, expandedFolders, libraryRoot),
    [operations, expandedFolders, libraryRoot],
  );

  const { clampToRange, cursorIndex, moveUp, moveDown } = useVimNav({
    totalCount: visibleNodes.length,
  });

  useEffect(() => {
    clampToRange();
  }, [clampToRange]);

  const currentNode = visibleNodes[cursorIndex] ?? null;

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleEnter = useCallback(() => {
    if (currentNode?.type === "leaf") {
      onSelect(currentNode.node.operation.id);
    }
  }, [currentNode, onSelect]);

  const handleSpace = useCallback(() => {
    if (currentNode?.type === "leaf") {
      onToggle(currentNode.node.operation.id);
    }
  }, [currentNode, onToggle]);

  const handleA = useCallback(() => {
    if (currentNode?.type === "leaf") {
      const folder = getOperationFolder(currentNode.node.operation.operation);
      onAcceptFolder(folder);
    }
  }, [currentNode, onAcceptFolder]);

  const handleR = useCallback(() => {
    if (currentNode?.type === "leaf") {
      const folder = getOperationFolder(currentNode.node.operation.operation);
      onRejectFolder(folder);
    }
  }, [currentNode, onRejectFolder]);

  const handleM = useCallback(() => {
    if (currentNode?.type === "leaf") {
      onSelect(currentNode.node.operation.id);
    }
  }, [currentNode, onSelect]);

  const handleH = useCallback(() => {
    if (
      currentNode?.type === "folder" &&
      expandedFolders.has(currentNode.node.path)
    ) {
      toggleFolder(currentNode.node.path);
    }
  }, [currentNode, expandedFolders, toggleFolder]);

  const handleL = useCallback(() => {
    if (
      currentNode?.type === "folder" &&
      !expandedFolders.has(currentNode.node.path)
    ) {
      toggleFolder(currentNode.node.path);
    }
  }, [currentNode, expandedFolders, toggleFolder]);

  useKeyboard((key) => {
    if (showHelp) {
      if (key.name === "slash" && key.shift) {
        setShowHelp(false);
      }
      return;
    }

    if (selectedId) {
      if (key.name === "escape") {
        onSelect(null);
      }
      return;
    }

    switch (key.name) {
      case "j":
        moveDown();
        break;
      case "k":
        moveUp();
        break;
      case "h":
        handleH();
        break;
      case "l":
        handleL();
        break;
      case "return":
        handleEnter();
        break;
      case "space":
        handleSpace();
        break;
      case "a":
        if (key.shift) onAcceptAll();
        else handleA();
        break;
      case "r":
        if (key.shift) onRejectAll();
        else handleR();
        break;
      case "m":
        handleM();
        break;
      case "/":
        if (key.shift) setShowHelp(true);
        break;
      case "q":
        renderer.destroy();
        break;
    }
  });

  return (
    <box flexDirection="column" flexGrow={1}>
      <box
        backgroundColor="#1a1a2e"
        flexDirection="row"
        justifyContent="space-between"
        paddingX={1}
      >
        <text>
          <span fg="#7aa2f7">[</span>
          <span fg="#c0caf5">j/k</span>
          <span fg="#565f89">:nav </span>
          <span fg="#c0caf5">h/l</span>
          <span fg="#565f89">:fold </span>
          <span fg="#c0caf5">Space</span>
          <span fg="#565f89">:toggle </span>
          <span fg="#c0caf5">Enter</span>
          <span fg="#565f89">:detail </span>
          <span fg="#c0caf5">a/r</span>
          <span fg="#565f89">:folder </span>
          <span fg="#c0caf5">A/R</span>
          <span fg="#565f89">:all </span>
          <span fg="#7aa2f7">]</span>
        </text>
      </box>

      <box flexDirection="column" flexGrow={1}>
        <TreeView
          cursorIndex={cursorIndex}
          expandedFolders={expandedFolders}
          visibleNodes={visibleNodes}
        />
      </box>

      <StatusBar mode="review" stats={stats} />

      {selectedId &&
        currentNode?.type === "leaf" &&
        (() => {
          const opState = currentNode.node.operation;
          return (
            <DetailModal onClose={() => onSelect(null)} operation={opState} />
          );
        })()}

      {showHelp && <HelpOverlay />}
    </box>
  );
}
