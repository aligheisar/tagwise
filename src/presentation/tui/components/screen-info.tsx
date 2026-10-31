import { Banner } from "@/components/ui/banner";
import { useTheme } from "@/hooks/use-theme";

const ScreenInfo = ({
  description,
  title,
}: {
  title: string;
  description: string;
}) => {
  const { colors } = useTheme();
  return (
    <Banner hideIcon title={title.toUpperCase()} variant="neutral">
      <text fg={colors.muted}>{description}</text>
    </Banner>
  );
};

export { ScreenInfo };
