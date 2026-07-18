import { use } from "react";
import { appContext } from "#/context/app-context";

const useApp = () => {
  const context = use(appContext);
  if (!context) throw Error("Context should be used inside its provider");
  return context;
};

export { useApp };
