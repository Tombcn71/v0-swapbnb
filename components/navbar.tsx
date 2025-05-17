"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-blue-600">SwapBnB</span>
        </Link>

        {/* Desktop navigatie */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/listings"
            className={`font-medium ${pathname === "/listings" || pathname.startsWith("/listings/") ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
          >
            Woningen
          </Link>
          <Link
            href="/how-it-works"
            className={`font-medium ${pathname === "/how-it-works" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
          >
            Hoe het werkt
          </Link>
          <Link
            href="/about"
            className={`font-medium ${pathname === "/about" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
          >
            Over ons
          </Link>
          <Link
            href="/contact"
            className={`font-medium ${pathname === "/contact" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
          >
            Contact
          </Link>
        </nav>

        {/* Knoppen */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/profile">Profiel</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Inloggen</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Registreren</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobiele menu knop */}
        <button className="md:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobiel menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t py-4 px-4">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/listings"
              className={`font-medium ${pathname === "/listings" || pathname.startsWith("/listings/") ? "text-blue-600" : "text-gray-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Woningen
            </Link>
            <Link
              href="/how-it-works"
              className={`font-medium ${pathname === "/how-it-works" ? "text-blue-600" : "text-gray-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Hoe het werkt
            </Link>
            <Link
              href="/about"
              className={`font-medium ${pathname === "/about" ? "text-blue-600" : "text-gray-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Over ons
            </Link>
            <Link
              href="/contact"
              className={`font-medium ${pathname === "/contact" ? "text-blue-600" : "text-gray-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-4 border-t border-gray-200">
              {session ? (
                <div className="flex flex-col space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      Profiel
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Inloggen
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Registreren
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
