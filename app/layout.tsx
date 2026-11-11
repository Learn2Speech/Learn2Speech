import type { Metadata, Viewport } from "next";
import { Onest, Sora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import CookieConsent from "@/components/cookie-consent";
import "./globals.css";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"] });

// display face for headings and readout numbers
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learn2Speech",
  description: "Upload a speech and get coaching on your pace, filler words and pauses.",
};

// phone status bar matches the page color in each theme; viewport-fit lets pages use the notch area
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F5F4" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0F10" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes adds the "dark" class to <html> before React loads,
    // so React would otherwise warn that the server's <html> and the browser's don't match
    <html
      lang="en"
      className={`${onest.variable} ${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* attribute="class": dark mode = a "dark" class on <html>, which globals.css listens for.
            defaultTheme="system": follow the computer's setting until someone clicks the switch. */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
