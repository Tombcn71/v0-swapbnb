"use client"

import Link from "next/link"
import { useLanguage } from "./language-provider"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { LogOut, Menu, Megaphone, Home, LayoutDashboard, Phone, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { signOut, useSession } from "next-auth/react"

export function Navbar() {
  const { t } = useLanguage()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  useEffect(() => {
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      // Use NextAuth's signOut function to properly log out
      await signOut({ redirect: false })
      // After successful logout, redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold flex items-center">
          <Megaphone className="h-5 w-5 mr-2" />
          PitchAI
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm">
                {t("nav.home")}
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                {t("nav.dashboard")}
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm">
                {t("nav.contact")}
              </Button>
            </Link>

            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-1" />
                {isLoggingOut ? t("nav.loggingOut") : t("nav.logout")}
              </Button>
            ) : (
              <Link href="/signin">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4 mr-1" />
                  {t("auth.signin")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet
              open={isMenuOpen}
              onOpenChange={(open) => {
                setIsMenuOpen(open)
                // Prevent body scrolling when menu is open
                if (open) {
                  document.body.style.overflow = "hidden"
                } else {
                  document.body.style.overflow = ""
                }
              }}
            >
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>{t("nav.menu")}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      router.push("/")
                      setIsMenuOpen(false)
                    }}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    {t("nav.home")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      router.push("/dashboard")
                      setIsMenuOpen(false)
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t("nav.dashboard")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      router.push("/contact")
                      setIsMenuOpen(false)
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {t("nav.contact")}
                  </Button>

                  {isAuthenticated ? (
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive hover:text-destructive"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? t("nav.loggingOut") : t("nav.logout")}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        router.push("/signin")
                        setIsMenuOpen(false)
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {t("auth.signin")}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
