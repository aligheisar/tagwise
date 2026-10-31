import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadProducers } from "../src/services/producer-loader.service";

let temporaryDirectory = "";

afterEach(async () => {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    temporaryDirectory = "";
  }
});

async function runCli(
  args: string[],
  cacheDirectory: string,
  input = "",
  configDirectory = path.join(cacheDirectory, "config"),
): Promise<{ exitCode: number; stderr: string; stdout: string }> {
  const childProcess = Bun.spawn(["bun", "run", "src/main.ts", ...args], {
    cwd: process.cwd(),
    env: {
      ...Bun.env,
      XDG_CACHE_HOME: cacheDirectory,
      XDG_CONFIG_HOME: configDirectory,
    },
    stderr: "pipe",
    stdin: "pipe",
    stdout: "pipe",
  });
  childProcess.stdin.write(input);
  childProcess.stdin.end();
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(childProcess.stdout).text(),
    new Response(childProcess.stderr).text(),
    childProcess.exited,
  ]);
  return { exitCode, stderr, stdout };
}

describe("CLI library cache workflow", () => {
  test("scans a folder and lists its cached library", async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-cli-test-"),
    );
    const cacheDirectory = path.join(temporaryDirectory, "cache");
    const musicDirectory = path.join(temporaryDirectory, "music");
    await mkdir(musicDirectory);

    const scan = await runCli(["scan", musicDirectory], cacheDirectory);
    expect(scan.exitCode).toBe(0);
    expect(scan.stderr).toContain('"message":"Scanned library"');

    const list = await runCli(["cache", "list"], cacheDirectory);
    expect(list.exitCode).toBe(0);
    expect(list.stdout).toContain(musicDirectory);
    expect(list.stdout).toContain("0 file(s)");
  });

  test("creates a typed producer from interactive prompts", async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-cli-producer-test-"),
    );
    const cacheDirectory = path.join(temporaryDirectory, "cache");
    const configDirectory = path.join(temporaryDirectory, "config");

    const result = await runCli(
      ["producer", "create"],
      cacheDirectory,
      "Example Producer\n1.2.3\nA producer used to test scaffolding\n",
      configDirectory,
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Created producer "example-producer"');
    const generated = await readFile(
      path.join(configDirectory, "tagwise", "producers", "example-producer.ts"),
      "utf8",
    );
    const sharedTypes = await readFile(
      path.join(configDirectory, "tagwise", "producer-types.ts"),
      "utf8",
    );
    expect(generated).toContain('title: "Example Producer"');
    expect(generated).toContain('type: "tag-update"');
    expect(generated).toContain("../producer-types");
    expect(sharedTypes).toContain(
      "readonly musicbrainzTrackId?: readonly string[]",
    );

    const loaded = await loadProducers(
      path.join(configDirectory, "tagwise", "producers"),
    );
    expect(loaded.errors).toEqual([]);
    expect(loaded.producers[0]).toMatchObject({
      name: "example-producer",
      title: "Example Producer",
      version: "1.2.3",
    });
  });
});
