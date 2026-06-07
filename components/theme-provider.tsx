"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export default function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>): React.ReactNode {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
