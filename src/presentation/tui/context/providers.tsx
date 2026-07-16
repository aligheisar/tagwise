import type { ReactNode } from "react";
import { LibrariesProvider } from "#/context/libraries-provider";

const Providers = ({ children }: { children: ReactNode }) => {
  return <LibrariesProvider>{children}</LibrariesProvider>;
};

export { Providers };
