// biome-ignore lint/complexity/noBannedTypes: needed for type identity
export type Query = {};
export type QueryClass<T extends Query = Query> = new (...args: never[]) => T;
