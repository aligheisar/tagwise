type VimJumpKey = {
  name: string;
  shift?: boolean;
};

type VimJumpAction = "first" | "last" | "pending" | null;

function getVimJumpAction(
  key: VimJumpKey,
  hasPendingG: boolean,
): VimJumpAction {
  if (key.name.toLowerCase() !== "g") return null;
  if (key.shift || key.name === "G") return "last";
  return hasPendingG ? "first" : "pending";
}

export type { VimJumpAction, VimJumpKey };
export { getVimJumpAction };
