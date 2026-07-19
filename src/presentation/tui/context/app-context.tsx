import { createContext } from "react";
import type { ContextValues } from "@/types/app-context";

const appContext = createContext<ContextValues | null>(null);

export { appContext };
