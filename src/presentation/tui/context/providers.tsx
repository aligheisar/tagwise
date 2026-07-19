import { Toaster } from "@opentui-ui/toast/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AppProvider } from "@/context/app-provider";
import { LibrariesProvider } from "@/context/libraries-provider";

const Providers = ({
  children,
  initialFolder,
}: {
  children: ReactNode;
  initialFolder?: string;
}) => {
  return (
    <AppProvider initialFolder={initialFolder}>
      <ThemeProvider>
        <Toaster />
        <LibrariesProvider>{children}</LibrariesProvider>
      </ThemeProvider>
    </AppProvider>
  );
};

export { Providers };
