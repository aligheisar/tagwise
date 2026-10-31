import os from "node:os";
import path from "node:path";

function resolveConfigDirectories(
  env: NodeJS.ProcessEnv = process.env,
  home = os.homedir(),
): { configDir: string; producersDir: string } {
  const configHome = path.resolve(
    env.XDG_CONFIG_HOME || path.join(home, ".config"),
  );
  const configDir = path.join(configHome, "tagwise");
  return { configDir, producersDir: path.join(configDir, "producers") };
}

function readPositiveInteger(
  name: string,
  fallback: number,
  maximum: number,
): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error(
      `${name} must be an integer between 1 and ${maximum}; received "${raw}"`,
    );
  }

  return value;
}

const config = {
  cacheDir: path.resolve(
    process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache"),
  ),
  ...resolveConfigDirectories(),
  filesystemConcurrency: readPositiveInteger(
    "TAGWISE_FILESYSTEM_CONCURRENCY",
    32,
    256,
  ),
  tagWriteBatchSize: readPositiveInteger(
    "TAGWISE_TAG_WRITE_BATCH_SIZE",
    128,
    4096,
  ),
  tagWriteConcurrency: readPositiveInteger(
    "TAGWISE_TAG_WRITE_CONCURRENCY",
    8,
    256,
  ),
};

export { config, readPositiveInteger, resolveConfigDirectories };
