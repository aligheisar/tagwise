import path from "node:path";

const expandPath = (p: string): string => {
  return p.replace(/^~(?=\/|$)/, process.env.HOME ?? "");
};

function isPathWithinRoot(root: string, target: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return (
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

export { expandPath, isPathWithinRoot };
