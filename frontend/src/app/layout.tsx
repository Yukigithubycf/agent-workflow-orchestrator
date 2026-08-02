import "katex/dist/katex.min.css";
import "streamdown/styles.css";
import "@/styles/globals.css";

import { type Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/core/i18n/context";
import { detectLocaleServer } from "@/core/i18n/server";

export const metadata: Metadata = {
  title: {
    default: "AstraFlow - Multi-Agent AI Platform",
    template: "%s | AstraFlow",
  },
  description: "A multi-agent AI platform for research, coding, and creation.",
  applicationName: "AstraFlow",
  icons: {
    icon: {
      url: "/logo.png",
      type: "image/png",
      sizes: "800x800",
    },
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await detectLocaleServer();
  return (
    <html lang={locale} suppressContentEditableWarning suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
