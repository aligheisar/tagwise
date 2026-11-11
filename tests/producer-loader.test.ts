import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  isProducer,
  loadProducers,
} from "../src/services/producer-loader.service";

let temporaryDirectory = "";

afterEach(async () => {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    temporaryDirectory = "";
  }
});

describe("loadProducers", () => {
  test("accepts producers that declare typed arguments", () => {
    expect(
      isProducer({
        args: [
          { key: "text", title: "Text", type: "string", default: "value" },
          { key: "count", title: "Count", type: "number", default: 2 },
          { key: "enabled", title: "Enabled", type: "boolean", default: true },
          {
            key: "mode",
            title: "Mode",
            type: "select",
            options: [
              { label: "First", value: "first" },
              { label: "Second", value: "second" },
            ],
            default: "first",
          },
        ],
        name: "custom",
        async produce() {
          return [];
        },
      }),
    ).toBe(true);

    expect(
      isProducer({
        args: [{ key: "mode", title: "Mode", type: "select", options: [] }],
        name: "invalid",
        async produce() {
          return [];
        },
      }),
    ).toBe(false);
  });

  test("loads valid ESM modules in stable filename order and isolates invalid ones", async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-producers-test-"),
    );
    const directory = path.join(temporaryDirectory, "producers");
    await mkdir(directory);
    await writeFile(
      path.join(directory, "zeta.mjs"),
      'export default { name: "zeta", async produce() { return []; } };',
    );
    await writeFile(
      path.join(directory, "alpha.mjs"),
      'export default { name: "alpha", async produce() { return []; } };',
    );
    await writeFile(path.join(directory, "invalid.mjs"), "export default {};");

    const result = await loadProducers(directory);

    expect(result.producers.map(({ name }) => name)).toEqual(["alpha", "zeta"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.message).toContain("default export");
  });

  test("treats a missing producer directory as an empty plugin set", async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-producers-test-"),
    );

    await expect(
      loadProducers(path.join(temporaryDirectory, "missing")),
    ).resolves.toEqual({ errors: [], producers: [] });
  });
});
