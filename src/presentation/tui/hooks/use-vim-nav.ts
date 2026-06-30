import { useCallback, useState } from "react";

type UseVimNavOptions = {
  totalCount: number;
};

type UseVimNavReturn = {
  cursorIndex: number;
  setCursorIndex: (index: number) => void;
  moveUp: () => void;
  moveDown: () => void;
  clampToRange: () => void;
};

export function useVimNav({ totalCount }: UseVimNavOptions): UseVimNavReturn {
  const [cursorIndex, setCursorIndex] = useState(0);

  const moveUp = useCallback(() => {
    setCursorIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setCursorIndex((prev) => Math.min(totalCount - 1, prev + 1));
  }, [totalCount]);

  const clampToRange = useCallback(() => {
    setCursorIndex((prev) => Math.min(totalCount - 1, Math.max(0, prev)));
  }, [totalCount]);

  return { clampToRange, cursorIndex, moveDown, moveUp, setCursorIndex };
}
