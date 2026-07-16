import { createContext } from "react";
import type { ContextValues } from "@/presentation/tui/types/libraries-context";

const librariesContext = createContext<ContextValues | null>(null);

export { librariesContext };
