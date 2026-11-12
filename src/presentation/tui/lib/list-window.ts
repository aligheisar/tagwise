type ListWindow = {
  endIndex: number;
  startIndex: number;
};

function getListWindow(
  totalCount: number,
  height: number,
  activeIndex: number,
): ListWindow {
  const windowSize = Math.max(0, Math.trunc(height));
  const lastStartIndex = Math.max(0, totalCount - windowSize);
  const startIndex = Math.min(
    lastStartIndex,
    Math.max(0, activeIndex - windowSize + 1),
  );

  return {
    endIndex: Math.min(totalCount, startIndex + windowSize),
    startIndex,
  };
}

export type { ListWindow };
export { getListWindow };
