import path from "node:path";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DetailModal } from "@/components/detail-modal";
import { StatusBar } from "@/components/status-bar";
import type { FlatNode } from "@/components/tree-view";
import { computeVisibleNodes, TreeView } from "@/components/tree-view";
import { useApp } from "@/hooks/use-app";
import { useVimNav } from "@/hooks/use-vim-nav";
import { colors } from "@/theme";

export function ReviewScreen() {
  const renderer = useRenderer();
  const {
    operations: {
      select,
      toggleGroup,
      moveGroup,
      operations,
      acceptAll,
      acceptFolder,
      rejectAll,
      rejectFolder,
      selectedId,
      stats,
    },
    folder,
    helpOpen,
    setScreen,
  } = useApp();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() =>
    folder ? new Set([folder]) : new Set(),
  );

  const visibleNodes: FlatNode[] = useMemo(
    () => computeVisibleNodes(operations, expandedFolders, folder ?? ""),
    [operations, expandedFolders, folder],
  );

  const { clampToRange, cursorIndex, moveUp, moveDown, setCursorIndex } =
    useVimNav({
      totalCount: visibleNodes.length,
    });
  const pendingCursorId = useRef<string | null>(null);

  useEffect(() => {
    setExpandedFolders((prev) => {
      if (!folder) return prev;
      const next = new Set(prev);
      next.add(folder);
      return next;
    });
  }, [folder]);

  useEffect(() => {
    clampToRange();
  }, [clampToRange]);

  useEffect(() => {
    const operationId = pendingCursorId.current;
    if (!operationId) return;
    const nextIndex = visibleNodes.findIndex(
      (node) => node.type === "leaf" && node.node.group.id === operationId,
    );
    if (nextIndex >= 0) setCursorIndex(nextIndex);
    pendingCursorId.current = null;
  }, [setCursorIndex, visibleNodes]);

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
      select(currentNode.node.group.id);
    }
  }, [currentNode, select]);

  const handleEnter = useCallback(() => {
    setScreen({ type: "apply" });
  }, [setScreen]);

  const handleSpace = useCallback(() => {
    if (currentNode?.type === "leaf") {
      toggleGroup(currentNode.node.group.filePath);
    }
  }, [currentNode, toggleGroup]);

  const handleA = useCallback(() => {
    if (currentNode?.type === "leaf") {
      const folder = path.dirname(currentNode.node.group.filePath);
      acceptFolder(folder);
    }
  }, [currentNode, acceptFolder]);

  const handleR = useCallback(() => {
    if (currentNode?.type === "leaf") {
      const folder = path.dirname(currentNode.node.group.filePath);
      rejectFolder(folder);
    }
  }, [currentNode, rejectFolder]);

  const handleM = useCallback(() => {
    if (currentNode?.type === "leaf") {
      select(currentNode.node.group.id);
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

  const handleMove = useCallback(
    (direction: -1 | 1) => {
      if (currentNode?.type !== "leaf") return;
      pendingCursorId.current = currentNode.node.group.id;
      moveGroup(currentNode.node.group.filePath, direction);
    },
    [currentNode, moveGroup],
  );

  useKeyboard((key) => {
    if (helpOpen) return;

    if (selectedId) {
      if (key.name === "escape") {
        select(null);
      }
      return;
    }

    switch (key.name) {
      case "j":
        if (key.shift) handleMove(1);
        else moveDown();
        break;
      case "k":
        if (key.shift) handleMove(-1);
        else moveUp();
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

      case "return":
        handleEnter();
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
      case "escape":
        setScreen({ type: "producer-select" });
        break;
      case "q":
        renderer.destroy();
        break;
    }
  });

  return (
    <box flexDirection="column" flexGrow={1}>
      <box
        backgroundColor={colors.bgDark}
        flexDirection="row"
        justifyContent="space-between"
        paddingX={1}
      >
        <text>
          <span fg={colors.accent}>[</span>
          <span fg={colors.fgBright}>j/k</span>
          <span fg={colors.muted}>:nav </span>
          <span fg={colors.fgBright}>J/K</span>
          <span fg={colors.muted}>:move </span>
          <span fg={colors.fgBright}>h/l</span>
          <span fg={colors.muted}>:fold </span>
          <span fg={colors.fgBright}>Space</span>
          <span fg={colors.muted}>:toggle </span>
          <span fg={colors.fgBright}>i</span>
          <span fg={colors.muted}>:detail </span>
          <span fg={colors.fgBright}>a/r</span>
          <span fg={colors.muted}>:folder </span>
          <span fg={colors.fgBright}>A/R</span>
          <span fg={colors.muted}>:all </span>
          <span fg={colors.fgBright}>Esc</span>
          <span fg={colors.muted}>:producers </span>
          <span fg={colors.accent}>]</span>
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

      {selectedId && currentNode?.type === "leaf" && (
        <DetailModal
          group={currentNode.node.group}
          onClose={() => select(null)}
        />
      )}
    </box>
  );
}
