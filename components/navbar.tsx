"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { UserSidebar } from "./layout/user-sidebar"
import { MessagesIndicator } from "./layout/messages-indicator"
import { Logo } from "@/components/ui/logo"
import { CreditsDisplay } from "./layout/credits-display"

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo size="lg" />

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/listings" className="text-gray-600 hover:text-gray-900">
            Woningen
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900">
            Over ons
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          {status === "loading" ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
          ) : session ? (
            <>
              {/* Credits display */}
              <CreditsDisplay />
              {/* Messages indicator - alleen op desktop */}
              <div className="hidden sm:block">
                <MessagesIndicator />
              </div>
              <UserSidebar />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Inloggen</Link>
              </Button>
              <Link href="/register">
                <Button>Registreren</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
