type Operation =
  | { type: "rename"; oldPath: string; newPath: string }
  | { type: "tag-update"; path: string; tags: Record<string, string | number> };

export type { Operation };
