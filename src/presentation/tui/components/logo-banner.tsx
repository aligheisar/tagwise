import { colors } from "#/theme";

const LogoBanner = () => {
  return (
    <box justifyContent="center">
      <text fg={colors.fgBright}>TAGWISE TUI</text>
      <text fg={colors.muted}>Music Library Tag Manager</text>
    </box>
  );
};

export { LogoBanner };
