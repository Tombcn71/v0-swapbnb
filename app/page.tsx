import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, UserPlus, Search, RefreshCw } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Tekst links, foto rechts */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Tekst links */}
          <div className="flex flex-col space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Swap je woning, eropuit in <span className="italic">Nederland</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600">
              ✅ Eenvoudig korte breaks plannen door heel Nederland <br />✅ Betaal per swap, zonder vaste
              verplichtingen
              <br />✅ Veilige uitwisseling dankzij ID-verificatie
            </p>

            <div className="flex gap-4 pt-4">
              <Link href="/listings">
                <Button size="lg" className="bg-black hover:bg-teal-600 text-white text-lg py-6 px-8">
                  Ontdek woningen
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white text-lg py-6 px-8"
                >
                  Inloggen
                </Button>
              </Link>
            </div>
          </div>

          {/* Nieuwe Hero Foto rechts */}
          <div className="relative w-full h-[600px] md:h-[700px] rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/hero3.png"
              alt="Moderne interieurs - woonkamer en keuken"
              fill
              priority
              style={{ objectFit: "cover" }}
              className="rounded-3xl"
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
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <UserPlus className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Maak een profiel aan</h3>
              <p className="text-gray-600">
                Registreer je en maak een aantrekkelijk profiel voor je woning met foto's en beschrijvingen.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vind je match</h3>
              <p className="text-gray-600">
                Zoek naar woningen op je gewenste bestemming en neem contact op met de eigenaren.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <RefreshCw className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Swap en geniet</h3>
              <p className="text-gray-600">
                Maak afspraken over de swap, wissel sleutels uit en geniet van je verblijf!
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/signup">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white text-lg py-6 px-10">
                Begin nu met swappen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Prijsvergelijking Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Swap & verblijf voor een fractie van de kosten</h2>

              <p className="text-lg text-gray-600">2 nachten vergelijking</p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border p-6 rounded-lg">
                  <p className="text-lg font-medium mb-2">Swap met SwapBnB</p>
                  <p className="text-4xl font-bold">€10</p>
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
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white text-lg py-5 px-8"
                >
                  Meer over prijzen <ArrowRightIcon className="h-5 w-5" />
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

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Veelgestelde vragen</h2>
            <p className="text-lg text-gray-600">Alles wat je wilt weten over huizenswap met SwapBnB</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Linker kolom */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-teal-600">Hoe werkt huizenswap?</h3>
                  <p className="text-gray-600">
                    Je ruilt tijdelijk van woning met een ander gezin. Jullie verblijven in elkaars huis terwijl de
                    eigenaren er niet zijn. Zo geniet je van een volledige woning zonder hotelkosten.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-teal-600">Wat kost het?</h3>
                  <p className="text-gray-600">
                    Geen lidmaatschapskosten! Je betaalt alleen €20 per succesvolle swap voor platformkosten en
                    verificatie. Veel goedkoper dan hotels of vakantiehuizen.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-teal-600">Is het veilig?</h3>
                  <p className="text-gray-600">
                    Ja! Alle gebruikers worden geverifieerd, we hebben een beoordelingssysteem en je communiceert eerst
                    via ons platform voordat je een swap bevestigt.
                  </p>
                </div>
              </div>

              {/* Rechter kolom */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-teal-600">Kan ik mijn eigen huis aanbieden?</h3>
                  <p className="text-gray-600">
                    Absoluut! Voeg je woning toe met foto's en beschrijving. Hoe aantrekkelijker je profiel, hoe meer
                    kans op leuke swaps. Je bepaalt zelf wanneer je huis beschikbaar is.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-teal-600">Wat als er iets kapot gaat?</h3>
                  <p className="text-gray-600">
                    We raden aan om vooraf afspraken te maken over kleine schades. Voor grotere problemen kun je contact
                    opnemen met onze klantenservice voor bemiddeling.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-teal-600">Hoe lang kan ik swappen?</h3>
                  <p className="text-gray-600">
                    Van een weekend tot enkele weken - jullie bepalen samen de periode. Ideaal voor korte breaks,
                    vakantie of een change of scenery tijdens thuiswerken.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">Heb je nog andere vragen?</p>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white text-lg py-5 px-8"
                >
                  Neem contact op
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer met Teal Gradient */}
      <footer className="bg-gradient-to-br from-teal-500 to-teal-700 text-white py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SwapBnB</h3>
              <p className="text-teal-50">
                Ontdek Nederland door huizen te swappen en geniet van authentieke ervaringen zonder hotelkosten.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/listings" className="text-teal-100 hover:text-white transition-colors">
                    Woningen
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-teal-100 hover:text-white transition-colors">
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-teal-100 hover:text-white transition-colors">
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-teal-100 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-teal-100 hover:text-white transition-colors">
                    Inloggen
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-teal-100 hover:text-white transition-colors">
                    Registreren
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-teal-100 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-teal-100 hover:text-white transition-colors">
                    Profiel
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <address className="not-italic text-teal-50">
                <p>Swapstraat 123</p>
                <p>1234 AB Amsterdam</p>
                <p>Nederland</p>
                <p className="mt-2">info@swapbnb.nl</p>
                <p>+31 20 123 4567</p>
              </address>
            </div>
          </div>

          <div className="border-t border-teal-400/30 mt-8 pt-8 text-center text-teal-50">
            <p>&copy; {new Date().getFullYear()} SwapBnB. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
