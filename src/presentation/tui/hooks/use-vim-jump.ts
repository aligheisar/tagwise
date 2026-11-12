import { useCallback, useEffect, useRef } from "react";
import { getVimJumpAction, type VimJumpKey } from "@/lib/vim-navigation";

type UseVimJumpOptions = {
  totalCount: number;
  onJump: (index: number) => void;
};

export function useVimJump({ totalCount, onJump }: UseVimJumpOptions) {
  const hasPendingG = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingG = useCallback(() => {
    hasPendingG.current = false;
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  useEffect(() => clearPendingG, [clearPendingG]);

  return useCallback(
    (key: VimJumpKey) => {
      const action = getVimJumpAction(key, hasPendingG.current);
      if (action === null) {
        clearPendingG();
        return false;
      }

      if (action === "pending") {
        hasPendingG.current = true;
        timeout.current = setTimeout(clearPendingG, 500);
        return true;
      }

      clearPendingG();
      if (totalCount > 0) {
        onJump(action === "first" ? 0 : totalCount - 1);
      }
      return true;
    },
    [clearPendingG, onJump, totalCount],
  );
}
