import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResearchSpace",
  description: "Organize your research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} w-[400px] h-[600px] overflow-hidden bg-gray-50 dark:bg-zinc-900 transition-colors duration-200 flex flex-col`}
      >
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
