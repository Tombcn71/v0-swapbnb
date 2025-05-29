"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { UserSidebar } from "./user-sidebar"
import { Logo } from "@/components/ui/logo"

export function Header() {
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

        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
          ) : session ? (
            <UserSidebar />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Inloggen</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registreren</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
