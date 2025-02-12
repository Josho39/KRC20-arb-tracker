'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import VerticalMenu from "@/components/vertical-menu";
import TopNav from "@/components/top-nav";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TopNav onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />
          <VerticalMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
          <main className="min-h-screen bg-background pt-16">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}