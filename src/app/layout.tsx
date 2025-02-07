import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import NavLayout from "@/components/nav-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KRC20 Tools",
  description: "Analysis and trading tools for KRC20 tokens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavLayout>
            {children}
          </NavLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}