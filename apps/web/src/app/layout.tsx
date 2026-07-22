import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

/**
 * Outfit — primary font matching mobile app fontFamily token
 * apps/mobile/lib/theme.ts → fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif"
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ahoj — Next-Gen Proximity Social Network",
  description: "Discover nearby people, spontaneous meetups, and real-time stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="page-shell flex flex-col min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
