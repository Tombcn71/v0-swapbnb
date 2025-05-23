import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPinIcon, EuroIcon, UmbrellaIcon, BikeIcon, ArrowRightIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Tekst links, foto rechts */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Tekst links */}
          <div className="flex flex-col space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Swap je woning, eropuit in Nederland</h1>

            <p className="text-lg md:text-xl text-gray-600">
              Korte breaks, slim budget: geen abonnementskosten, betaal per swap.
            </p>

            <div className="flex gap-4 pt-4">
              <Button asChild size="lg">
                <Link href="/listings">Ontdek woningen</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Inloggen</Link>
              </Button>
            </div>
          </div>

          {/* Foto rechts */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl">
            <Image
              src="https://images.pexels.com/photos/6338457/pexels-photo-6338457.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Gelukkig gezin"
              fill
              priority
              style={{ objectFit: "cover" }}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      

      {/* Hoe werkt het Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Hoe werkt het?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mb-4 font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Maak een profiel aan</h3>
              <p className="text-gray-600">
                Registreer je en maak een aantrekkelijk profiel voor je woning met foto's en beschrijvingen.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mb-4 font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Vind je match</h3>
              <p className="text-gray-600">
                Zoek naar woningen op je gewenste bestemming en neem contact op met de eigenaren.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mb-4 font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Swap en geniet</h3>
              <p className="text-gray-600">
                Maak afspraken over de swap, wissel sleutels uit en geniet van je verblijf!
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/signup">Begin nu met swappen</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Prijsvergelijking Section - NIEUW */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Swap & verblijf voor een fractie van de kosten</h2>

              <p className="text-lg text-gray-600">2 nachten vergelijking</p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border p-6 rounded-lg">
                  <p className="text-lg font-medium mb-2">Swap met SwapBnB</p>
                  <p className="text-4xl font-bold">€20</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-lg font-medium mb-2">Hotel of huurwoning</p>
                  <p className="text-4xl font-bold">€220+</p>
                </div>
              </div>

              <p className="text-gray-600 mt-4">
                Geen lidmaatschapskosten.
                <br />
                Betaal alleen voor platformkosten per verblijf.
              </p>

              <div className="mt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  Meer over prijzen <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl">
              <Image
                src="https://images.pexels.com/photos/5330982/pexels-photo-5330982.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Gezellige woonkamer met planten"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer met Google Blue */}
      <footer className="bg-[#4285F4] text-white py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SwapBnB</h3>
              <p className="text-white">
                Ontdek Nederland door huizen te swappen en geniet van authentieke ervaringen zonder hotelkosten.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/listings" className="text-blue-100 hover:text-white">
                    Woningen
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-blue-100 hover:text-white">
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-blue-100 hover:text-white">
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-blue-100 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-blue-100 hover:text-white">
                    Inloggen
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-blue-100 hover:text-white">
                    Registreren
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-blue-100 hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-blue-100 hover:text-white">
                    Profiel
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <address className="not-italic text-blue-100">
                <p>Swapstraat 123</p>
                <p>1234 AB Amsterdam</p>
                <p>Nederland</p>
                <p className="mt-2">info@swapbnb.nl</p>
                <p>+31 20 123 4567</p>
              </address>
            </div>
          </div>

          <div className="border-t border-blue-300 mt-8 pt-8 text-center text-white">
            <p>&copy; {new Date().getFullYear()} SwapBnB. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
