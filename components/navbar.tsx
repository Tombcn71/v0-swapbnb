import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-google-blue">
              <Home className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">SwapBnB</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/how-it-works" className="text-gray-600 hover:text-google-blue">
              Hoe het werkt
            </Link>
            <Link href="/listings" className="text-gray-600 hover:text-google-blue">
              Woningen
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-google-blue">
              Over ons
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/login">Inloggen</Link>
            </Button>
            <Button className="bg-google-blue hover:bg-blue-600" asChild>
              <Link href="/register">Registreren</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
