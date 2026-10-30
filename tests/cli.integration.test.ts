import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

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
): Promise<{ exitCode: number; stderr: string; stdout: string }> {
  const childProcess = Bun.spawn(["bun", "run", "src/main.ts", ...args], {
    cwd: process.cwd(),
    env: { ...Bun.env, XDG_CACHE_HOME: cacheDirectory },
    stderr: "pipe",
    stdout: "pipe",
  });
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
});
