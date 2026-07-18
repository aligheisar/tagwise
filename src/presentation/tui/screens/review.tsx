import { useKeyboard, useRenderer } from "@opentui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DetailModal } from "#/components/detail-modal";
import { HelpOverlay } from "#/components/help-overlay";
import { StatusBar } from "#/components/status-bar";
import type { FlatNode } from "#/components/tree-view";
import { computeVisibleNodes, TreeView } from "#/components/tree-view";
import { getOperationFolder } from "#/hooks/use-operations";
import { useVimNav } from "#/hooks/use-vim-nav";
import { useApp } from "@/presentation/tui/hooks/use-app";

export function ReviewScreen() {
  const renderer = useRenderer();
  const [showHelp, setShowHelp] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const {
    operations: {
      select,
      toggle,
      operations,
      acceptAll,
      acceptFolder,
      rejectAll,
      rejectFolder,
      selectedId,
      stats,
    },
    folder,
  } = useApp();

  const visibleNodes: FlatNode[] = useMemo(
    () => computeVisibleNodes(operations, expandedFolders, folder ?? ""),
    [operations, expandedFolders, folder],
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

  const handleI = useCallback(() => {
    if (currentNode?.type === "leaf") {
      select(currentNode.node.operation.id);
    }
  }, [currentNode, select]);

  const handleSpace = useCallback(() => {
    if (currentNode?.type === "leaf") {
      toggle(currentNode.node.operation.id);
    }
  }, [currentNode, toggle]);

  const handleA = useCallback(() => {
    if (currentNode?.type === "leaf") {
      const folder = getOperationFolder(currentNode.node.operation.operation);
      acceptFolder(folder);
    }
  }, [currentNode, acceptFolder]);

  const handleR = useCallback(() => {
    if (currentNode?.type === "leaf") {
      const folder = getOperationFolder(currentNode.node.operation.operation);
      rejectFolder(folder);
    }
  }, [currentNode, rejectFolder]);

  const handleM = useCallback(() => {
    if (currentNode?.type === "leaf") {
      select(currentNode.node.operation.id);
    }
  }, [currentNode, select]);

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
        select(null);
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
      case "i":
        handleI();
        break;
      case "space":
        handleSpace();
        break;
      case "a":
        if (key.shift) acceptAll();
        else handleA();
        break;
      case "r":
        if (key.shift) rejectAll();
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
          <span fg="#c0caf5">i</span>
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
            <DetailModal onClose={() => select(null)} operation={opState} />
          );
        })()}

      {showHelp && <HelpOverlay />}
    </box>
  );
}
