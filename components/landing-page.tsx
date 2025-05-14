"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Users, CheckCircle, ArrowRight } from "lucide-react"

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Home className="h-6 w-6 text-google-blue mr-2" />
            <span className="text-xl font-bold text-google-blue">SwapBnB</span>
          </div>
          <nav className="hidden md:flex space-x-6">
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
          <div className="flex space-x-4">
            <Button variant="outline" asChild>
              <Link href="/login">Inloggen</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Registreren</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-google-blue to-blue-400 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Wissel van huis, niet van budget</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Ontdek een nieuwe manier van reizen door huizen te ruilen met andere Nederlanders
            </p>
            <Button size="lg" className="bg-white text-google-blue hover:bg-gray-100">
              Begin met ruilen
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Waarom SwapBnB?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Home className="h-12 w-12 text-google-blue mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Bespaar geld</h3>
                    <p className="text-gray-600">
                      Geen accommodatiekosten, alleen een kleine servicevergoeding per succesvolle ruil
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Users className="h-12 w-12 text-google-blue mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Leef als een local</h3>
                    <p className="text-gray-600">
                      Ervaar een nieuwe stad of dorp vanuit het perspectief van een inwoner
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className="h-12 w-12 text-google-blue mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Veilig en vertrouwd</h3>
                    <p className="text-gray-600">
                      Geverifieerde gebruikers en beoordelingen zorgen voor een veilige ervaring
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Hoe het werkt</h2>
            <div className="max-w-4xl mx-auto">
              <div className="flex mb-8">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-google-blue text-white font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Maak een account</h3>
                  <p className="text-gray-600">Registreer en verifieer je identiteit</p>
                </div>
              </div>
              <div className="flex mb-8">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-google-blue text-white font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Voeg je woning toe</h3>
                  <p className="text-gray-600">Upload foto's en details van je huis</p>
                </div>
              </div>
              <div className="flex mb-8">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-google-blue text-white font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Vind een match</h3>
                  <p className="text-gray-600">Zoek naar woningen die beschikbaar zijn wanneer jij wilt ruilen</p>
                </div>
              </div>
              <div className="flex mb-8">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-google-blue text-white font-bold mr-4">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Maak afspraken</h3>
                  <p className="text-gray-600">Communiceer via ons berichtensysteem om details af te stemmen</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-google-blue text-white font-bold mr-4">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Bevestig de ruil</h3>
                  <p className="text-gray-600">Betaal de servicevergoeding en geniet van je verblijf</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Klaar om te beginnen?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Word lid van onze gemeenschap en ontdek een nieuwe manier van reizen door heel Nederland.
            </p>
            <Button size="lg" className="bg-google-blue hover:bg-blue-600">
              <span>Maak een account aan</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SwapBnB</h3>
              <p className="text-gray-300">De beste manier om van huis te wisselen in Nederland.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/how-it-works" className="text-gray-300 hover:text-white">
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link href="/listings" className="text-gray-300 hover:text-white">
                    Woningen
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    Over ons
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Ondersteuning</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Nieuwsbrief</h3>
              <p className="text-gray-300 mb-2">Blijf op de hoogte van nieuwe functies en updates.</p>
              <div className="flex">
                <input type="email" placeholder="E-mailadres" className="px-3 py-2 text-black rounded-l-md w-full" />
                <Button className="rounded-l-none">Aanmelden</Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} SwapBnB. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
