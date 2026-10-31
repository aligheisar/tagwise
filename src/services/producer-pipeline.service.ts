import { MutableLibrary } from "#/lib/mutable-library";
import type { Library } from "#/types/library";
import type { Operation } from "#/types/operation";
import type { Producer } from "#/types/producer";

type ProducerPipelineResult = {
  operations: Operation[];
  projectedLibrary: ReturnType<MutableLibrary["snapshot"]>;
};

function getTargetPath(operation: Operation): string | null {
  if (operation.type === "rename") return operation.oldPath;
  if (operation.type === "tag-update") return operation.path;
  return null;
}

function isNoopTagUpdate(
  currentTags: Record<string, unknown>,
  updates: Record<string, string | number>,
): boolean {
  return Object.entries(updates).every(([key, nextValue]) => {
    const currentValue = currentTags[key];
    if (Array.isArray(currentValue)) {
      return currentValue.length === 1 && currentValue[0] === nextValue;
    }
    return currentValue === nextValue;
  });
}

async function runProducerPipeline(
  library: Library,
  producers: Producer[],
): Promise<ProducerPipelineResult> {
  const projection = new MutableLibrary(library);
  const operations: Operation[] = [];
  const originalPathByCurrentPath = new Map(
    library.items.flatMap((item) =>
      item.status === "ok" ? [[item.path, item.path]] : [],
    ),
  );

  for (const producer of producers) {
    const snapshot = projection.snapshot();
    const generated = await producer.produce(snapshot);
    if (!Array.isArray(generated)) {
      throw new Error(`Producer "${producer.name}" must return an array`);
    }

    for (const operation of generated) {
      const currentPath = getTargetPath(operation);
      if (currentPath === null) {
        projection.applyOperation(operation);
        continue;
      }

      const currentItem = snapshot.items.find(
        (item) => item.path === currentPath && item.status === "ok",
      );
      if (
        operation.type === "rename" &&
        operation.oldPath === operation.newPath
      ) {
        continue;
      }
      if (
        operation.type === "tag-update" &&
        currentItem?.status === "ok" &&
        isNoopTagUpdate(
          currentItem.tags as Record<string, unknown>,
          operation.tags,
        )
      ) {
        continue;
      }

      const originalPath =
        originalPathByCurrentPath.get(currentPath) ?? currentPath;
      const previousTags =
        operation.type === "tag-update" && currentItem?.status === "ok"
          ? Object.fromEntries(
              Object.keys(operation.tags).map((key) => [
                key,
                (currentItem.tags as Record<string, unknown>)[key],
              ]),
            )
          : undefined;
      const reviewedOperation: Operation = {
        ...operation,
        metadata: {
          ...operation.metadata,
          filePath: originalPath,
          ...(previousTags ? { previousTags } : {}),
          producerName: producer.name,
        },
      };

      projection.applyOperation(reviewedOperation);
      operations.push(reviewedOperation);

      if (reviewedOperation.type === "rename") {
        originalPathByCurrentPath.delete(reviewedOperation.oldPath);
        originalPathByCurrentPath.set(reviewedOperation.newPath, originalPath);
      }
    }
  }

  return { operations, projectedLibrary: projection.snapshot() };
}

export type { ProducerPipelineResult };
export { runProducerPipeline };
