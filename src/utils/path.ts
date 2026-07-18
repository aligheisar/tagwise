const expandPath = (p: string): string => {
  return p.replace(/^~(?=\/|$)/, process.env.HOME ?? "");
};

export { expandPath };
