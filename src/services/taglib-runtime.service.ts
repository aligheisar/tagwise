import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { TagLib } from "taglib-wasm";
import wasmAssetPath from "../../node_modules/taglib-wasm/dist/taglib-wasi.wasm" with {
  type: "file",
};

const initializeTagLib = TagLib.initialize.bind(TagLib);

TagLib.initialize = async (options) => {
  if (options?.wasmBinary || options?.wasmUrl) {
    return initializeTagLib(options);
  }

  const directory = await mkdtemp(path.join(os.tmpdir(), "tagwise-taglib-"));
  const wasmPath = path.join(directory, "taglib-wasi.wasm");

  try {
    const wasm = new Uint8Array(await Bun.file(wasmAssetPath).arrayBuffer());
    await writeFile(wasmPath, wasm);
    return await initializeTagLib({
      ...options,
      forceWasmType: "wasi",
      wasmUrl: wasmPath,
    });
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
};
