const expandPath = (p: string): string => {
  return p.startsWith("~") ? p.replace("~", process.env.HOME ?? "") : p;
};

export { expandPath };
