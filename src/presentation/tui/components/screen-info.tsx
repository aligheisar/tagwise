import { colors } from "@/theme";

const ScreenInfo = ({
  description,
  title,
}: {
  title: string;
  description: string;
}) => {
  return (
    <box>
      <text fg={colors.fgBright}>{title.toUpperCase()}</text>
      <text fg={colors.muted}>{description}</text>
    </box>
  );
};

export { ScreenInfo };
