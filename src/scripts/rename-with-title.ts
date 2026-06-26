import { existsSync } from "node:fs";
import { rename } from "node:fs/promises";
import path from "node:path";
import { tryCatch } from "@aligheisar/try-catch";
import sanitize from "sanitize-filename";
import { scanFolder } from "taglib-wasm/folder";
import { scanFolderOptions } from "../config/scan-folder";
import type { FolderScanItemError, RenameResult } from "../types";

const renameFilesUsingTitle = async (root: string) => {
  const result = await scanFolder(root, scanFolderOptions());

  const errors: FolderScanItemError[] = [];
  const success: RenameResult[] = [];

  for (const item of result.items) {
    if (item.status !== "ok") {
      errors.push({
        ...item,
        error: { message: item.error.message, type: "Reading" },
      });
      continue;
    }

    if (!item.tags.title?.[0]) {
      errors.push({
        error: { message: "No title tag found", type: "Tagging" },
        path: item.path,
      });
      continue;
    }

    const title = sanitize(item.tags.title[0].trim());
    const baseName = path.parse(item.path).name;
    const newPath = path.join(
      path.dirname(item.path),
      title + path.extname(item.path),
    );

    if (title === baseName) continue;

    if (existsSync(newPath)) {
      errors.push({
        error: {
          message: "File with this name already exists",
          type: "Rename",
        },
        path: item.path,
      });
      continue;
    }

    const renameResult = await tryCatch(
      rename(
        item.path,
        path.join(path.dirname(item.path), title + path.extname(item.path)),
      ),
    );

    if (!renameResult.success) {
      errors.push({
        error: {
          message: "Failed to rename",
          type: "Writing",
        },
        path: item.path,
      });
    } else {
      success.push({
        newName: title,
        oldName: baseName,
        path: item.path,
      });
    }
  }

  return { errors, success };
};

export { renameFilesUsingTitle };
