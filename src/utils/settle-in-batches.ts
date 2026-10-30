async function settleInBatches<T, R>(
  items: readonly T[],
  batchSize: number,
  operation: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let offset = 0; offset < items.length; offset += batchSize) {
    const batch = items.slice(offset, offset + batchSize);
    results.push(
      ...(await Promise.allSettled(
        batch.map((item) => Promise.resolve().then(() => operation(item))),
      )),
    );
  }
  return results;
}

export { settleInBatches };
