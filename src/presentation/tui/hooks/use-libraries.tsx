import { use } from "react";
import { librariesContext } from "#/context/libraries-context";

const useLibraries = () => {
  const context = use(librariesContext);
  if (!context) throw Error("Context should be used inside its provider");
  return context;
};

export { useLibraries };
