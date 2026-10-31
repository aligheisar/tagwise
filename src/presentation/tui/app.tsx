import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { HelpOverlay } from "@/components/help-overlay";
import { useApp } from "@/hooks/use-app";
import { isHelpToggleKey } from "@/lib/shortcuts";
import { ApplyScreen } from "@/screens/apply";
import { ProducerSelect } from "@/screens/producer-select";
import { ReviewScreen } from "@/screens/review";
import { ScanningScreen } from "@/screens/scanning";
import { WelcomeScreen } from "@/screens/welcome";

export function App() {
  const { helpOpen, helpShortcutEnabled, screen, toggleHelp } = useApp();

  useKeyboard((key) => {
    if (isHelpToggleKey(key, helpShortcutEnabled)) toggleHelp();
  });

  let screenContent: ReactNode;
  switch (screen.type) {
    case "welcome":
      screenContent = <WelcomeScreen />;
      break;
    case "scanning":
      screenContent = <ScanningScreen />;
      break;
    case "producer-select":
      screenContent = <ProducerSelect />;
      break;
    case "review":
      screenContent = <ReviewScreen />;
      break;
    case "apply":
      screenContent = <ApplyScreen />;
      break;
    default:
      screenContent = <text>Unknown screen</text>;
  }

  return (
    <box flexGrow={1}>
      {screenContent}
      {helpOpen && <HelpOverlay screen={screen.type} />}
    </box>
  );
}
