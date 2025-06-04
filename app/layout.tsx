import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { NextAuthProvider } from "@/components/providers/session-provider"
import { Navbar } from "@/components/navbar"
import { BannerProvider } from "@/components/providers/banner-provider"
import { OnboardingProvider } from "@/components/providers/onboarding-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SwapBnB - Huizenruil in Nederland",
  description: "Wissel tijdelijk van huis met andere Nederlanders",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <OnboardingProvider>
              <BannerProvider />
              <Navbar />
              {children}
              <Toaster />
            </OnboardingProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
