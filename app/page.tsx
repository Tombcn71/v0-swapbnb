import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPinIcon, EuroIcon, UmbrellaIcon, BikeIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh] md:h-[70vh]">
        <Image
          src="https://images.pexels.com/photos/6338457/pexels-photo-6338457.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Gelukkig gezin"
          fill
          priority
          style={{ objectFit: "cover" }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Swap je huis, ontdek Nederland
          </h1>
          <p className="mb-6 text-lg md:text-xl text-white drop-shadow-lg max-w-3xl">
            Zeg maar dag tegen hotels en accomodaties die de prijzen verhogen net wanneer jij vrij hebt of je kinderen
            vakantie hebben
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/listings">Ontdek woningen</Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/20 text-white">
              <Link href="/login">Inloggen</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Waarom SwapBnB Section - Focus op Nederland */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Waarom SwapBnB?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <MapPinIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ontdek heel Nederland</h3>
              <p className="text-gray-600">
                Van de Waddeneilanden tot Limburg, verken de mooiste plekken van ons land door te swappen met andere
                Nederlanders.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <EuroIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bespaar op vakantiekosten</h3>
              <p className="text-gray-600">
                Met de stijgende prijzen in Nederland is swappen de ideale manier om voordelig vakantie te vieren in
                eigen land.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <UmbrellaIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Altijd een plan B</h3>
              <p className="text-gray-600">
                Met het Nederlandse weer is een last-minute swap naar een andere regio ideaal om toch van de zon te
                genieten.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <BikeIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Leef als een local</h3>
              <p className="text-gray-600">
                Gebruik de fietsen van je swap-partner en ontdek de omgeving zoals een echte Nederlander dat zou doen.
              </p>
            </div>
          </div>
        </div>
      </section>

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

      {/* Footer */}
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
                  <Link href="/listings" className="text-white hover:text-white">
                    Woningen
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-white hover:text-white">
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-white hover:text-white">
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-white hover:text-white">
                    Inloggen
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-whitehover:text-white">
                    Registreren
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-white hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-white hover:text-white">
                    Profiel
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <address className="not-italic text-white">
                <p>Swapstraat 123</p>
                <p>1234 AB Amsterdam</p>
                <p>Nederland</p>
                <p className="mt-2">info@swapbnb.nl</p>
                <p>+31 20 123 4567</p>
              </address>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-white">
            <p>&copy; {new Date().getFullYear()} SwapBnB. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
