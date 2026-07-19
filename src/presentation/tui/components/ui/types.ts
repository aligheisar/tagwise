import type { ReactNode } from "react";

export type BorderStyle = "single" | "double" | "rounded" | "heavy";

export interface ColorTokens {
  accent: string;
  accentForeground: string;
  background: string;
  border: string;
  error: string;
  errorForeground: string;
  focusRing: string;
  foreground: string;
  info: string;
  infoForeground: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  selection: string;
  selectionForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
}

export interface SpacingTokens {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  6: number;
  8: number;
}

export interface TypographyTokens {
  base: string;
  bold: boolean;
  lg: string;
  sm: string;
  xl: string;
}

export interface BorderTokens {
  color: string;
  focusColor: string;
  style: BorderStyle;
}

export interface Theme {
  border: BorderTokens;
  colors: ColorTokens;
  name: string;
  spacing: SpacingTokens;
  typography: TypographyTokens;
}

export interface MotionContextValue {
  reduced: boolean;
}

export interface UnicodeContextValue {
  unicode: boolean;
}

export interface ThemeContextValue {
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

export interface ThemeProviderProps {
  children: ReactNode;
  noUnicode?: boolean;
  reducedMotion?: boolean;
  theme?: Theme;
}

export interface AutoThemeProviderProps {
  children: ReactNode;
  darkTheme: Theme;
  lightTheme: Theme;
}
