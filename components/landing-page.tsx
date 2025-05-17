"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import Image from "next/image"

export function LandingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleExploreClick = () => {
    setIsLoading(true)
    router.push("/listings")
  }

  const handleLoginClick = () => {
    setIsLoading(true)
    router.push("/login")
  }

  const handleDashboardClick = () => {
    setIsLoading(true)
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Full Width Image - No Black Bars */}
      <div className="w-screen relative overflow-hidden h-[500px] md:h-[600px]">
        <Image
          src="/family-travel-hero.jpg"
          alt="Moeder en kind op reis met koffer"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/25" /> {/* Even lighter overlay (25%) */}
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-md">
            Ruil je huis, ontdek de wereld
          </h1>
          <p className="mb-8 text-lg md:text-xl text-white max-w-3xl drop-shadow-md">
            Ervaar het comfort van thuis, waar je ook bent. Ruil je woning en geniet van authentieke reiservaringen
            zonder hotelkosten.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <Button onClick={handleExploreClick} size="lg" className="text-lg px-8">
              {isLoading ? "Laden..." : "Ontdek woningen"}
            </Button>
            {session ? (
              <Button
                onClick={handleDashboardClick}
                variant="outline"
                size="lg"
                className="text-lg px-8 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              >
                {isLoading ? "Laden..." : "Naar Dashboard"}
              </Button>
            ) : (
              <Button
                onClick={handleLoginClick}
                variant="outline"
                size="lg"
                className="text-lg px-8 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              >
                {isLoading ? "Laden..." : "Inloggen"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Waarom SwapBnB?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Ontdek de voordelen van huisruil voor je volgende vakantie.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Bespaar op accommodatie</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Geen hotelkosten of huurprijzen. Ruil je huis en bespaar honderden euro's op je volgende reis.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Voel je thuis</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Geniet van alle gemakken van een echte woning: een volledig uitgeruste keuken, meerdere kamers en
                  lokale tips.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Veilig en betrouwbaar</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Onze gemeenschap is gebaseerd op vertrouwen en wederzijds respect. Geverifieerde gebruikers en
                  beoordelingen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Hoe werkt het?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              In vier eenvoudige stappen naar je volgende huisruil.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mb-4">
                  <span className="text-lg font-bold">1</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Maak een profiel aan</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Registreer je en voeg foto's en details toe over je woning.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mb-4">
                  <span className="text-lg font-bold">2</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Zoek een match</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Blader door beschikbare woningen en vind je perfecte match.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mb-4">
                  <span className="text-lg font-bold">3</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Maak afspraken</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Communiceer met je match en plan de details van jullie ruil.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mb-4">
                  <span className="text-lg font-bold">4</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Geniet van je reis</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Reis met een gerust hart en geniet van je verblijf in een echt thuis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Klaar om je huis te ruilen?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
              Word lid van onze gemeenschap en begin met het plannen van je volgende avontuur.
            </p>
            <div className="mt-8">
              <Button
                onClick={handleExploreClick}
                size="lg"
                className="text-lg px-8 bg-white text-blue-600 hover:bg-blue-50"
              >
                {isLoading ? "Laden..." : "Begin nu"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SwapBnB</h3>
              <p className="text-gray-300">
                De betere manier om te reizen. Ruil je huis en ontdek de wereld vanuit een lokaal perspectief.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Over ons
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Hoe het werkt
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Veelgestelde vragen
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">Heb je vragen? Neem contact met ons op via:</p>
              <p className="text-gray-300 mt-2">info@swapbnb.com</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p>© {new Date().getFullYear()} SwapBnB. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
