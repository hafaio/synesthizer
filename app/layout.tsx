import type { Metadata, Viewport } from "next";
import ThemeProvider from "../components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synesthizer",
  description:
    "A synesthetic synthesizer that turns images into piano compositions.",
  applicationName: "Synesthizer",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
