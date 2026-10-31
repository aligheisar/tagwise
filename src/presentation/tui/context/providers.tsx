import { Toaster } from "@opentui-ui/toast/react";
import type { ReactNode } from "react";
import { AppProvider } from "@/context/app-provider";
import { LibrariesProvider } from "@/context/libraries-provider";
import { defaultTheme } from "@/lib/terminal-themes/default";
import { ThemeProvider } from "@/providers/theme-provider";

const Providers = ({
  children,
  initialFolder,
}: {
  children: ReactNode;
  initialFolder?: string;
}) => {
  return (
    <AppProvider initialFolder={initialFolder}>
      <ThemeProvider theme={defaultTheme}>
        <Toaster />
        <LibrariesProvider>{children}</LibrariesProvider>
      </ThemeProvider>
    </AppProvider>
  );
};

export { Providers };
