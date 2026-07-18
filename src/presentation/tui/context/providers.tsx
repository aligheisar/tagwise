import type { ReactNode } from "react";
import { AppProvider } from "#/context/app-provider";
import { LibrariesProvider } from "#/context/libraries-provider";

const Providers = ({
  children,
  initialFolder,
}: {
  children: ReactNode;
  initialFolder?: string;
}) => {
  return (
    <AppProvider initialFolder={initialFolder}>
      <LibrariesProvider>{children}</LibrariesProvider>
    </AppProvider>
  );
};

export { Providers };
