import { useApp } from "#/hooks/use-app";
import { ApplyScreen } from "#/screens/apply";
import { ProducerSelect } from "#/screens/producer-select";
import { ReviewScreen } from "#/screens/review";
import { ScanningScreen } from "#/screens/scanning";
import { WelcomeScreen } from "#/screens/welcome";

export function App() {
  const { screen, setScreen } = useApp();
  switch (screen.type) {
    case "welcome":
      return <WelcomeScreen />;

    case "scanning":
      return <ScanningScreen />;

    case "producer-select":
      return <ProducerSelect />;

    case "review":
      return <ReviewScreen />;

    case "apply":
      return (
        <ApplyScreen
          onCancel={() => setScreen({ type: "welcome" })}
          onConfirm={opsState.apply}
          onError={(err) => {
            setScanError(err);
            setScreen({ type: "welcome" });
          }}
          stats={opsState.stats}
        />
      );

    default:
      return <text>Unknown screen</text>;
  }
}
