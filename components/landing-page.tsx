import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Users, Shield } from "lucide-react"
import { ArrowRight, Repeat, Star } from "lucide-react"

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-google-blue py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Wissel van huis, niet van budget</h1>
          <p className="text-xl mb-8 text-white max-w-3xl mx-auto">
            Ontdek een nieuwe manier van reizen door huizen te ruilen met andere Nederlanders
          </p>
          <Button asChild size="lg" className="bg-white text-google-blue hover:bg-gray-100">
            <Link href="/listings">Begin met ruilen</Link>
          </Button>
        </div>
      </section>

      {/* Why SwapBnB Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Waarom SwapBnB?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-google-blue mx-auto mb-4 flex justify-center">
                <Home className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bespaar geld</h3>
              <p className="text-gray-600">
                Geen accommodatiekosten, alleen een kleine servicevergoeding per succesvolle ruil
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-google-blue mx-auto mb-4 flex justify-center">
                <Users className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Leef als een local</h3>
              <p className="text-gray-600">Ervaar een nieuwe stad of dorp vanuit het perspectief van een inwoner</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-google-blue mx-auto mb-4 flex justify-center">
                <Shield className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Veilig en vertrouwd</h3>
              <p className="text-gray-600">
                Geverifieerde gebruikers en beoordelingen zorgen voor een veilige ervaring
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Hoe werkt het?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-google-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Voeg je woning toe</h3>
              <p className="text-gray-600">
                Maak een profiel aan voor je woning met foto's en beschrijvingen. Laat anderen zien wat jouw huis
                bijzonder maakt.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Repeat className="h-8 w-8 text-google-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Vind een match</h3>
              <p className="text-gray-600">
                Zoek naar woningen op jouw favoriete bestemming en neem contact op met de eigenaar om een ruil voor te
                stellen.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-google-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Geniet van je verblijf</h3>
              <p className="text-gray-600">
                Reis naar je bestemming en geniet van een authentieke ervaring in een echt thuis, zonder hotelkosten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Uitgelichte woningen</h2>
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/listings">
                Bekijk alle woningen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Listing 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative">
                <img
                  src="/placeholder.svg?key=6l1jq"
                  alt="Amsterdam Canal House"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-google-blue text-white px-3 py-1 rounded-full text-sm font-medium">Populair</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Karakteristiek grachtenpand</h3>
                <p className="text-gray-600 mb-4">Amsterdam, Nederland</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 h-5 w-5 fill-current" />
                    <span>4.8 (56 reviews)</span>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/homes/1">Bekijk details</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Featured Listing 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative">
                <img src="/placeholder.svg?key=001fv" alt="Barcelona Apartment" className="w-full h-64 object-cover" />
                <div className="absolute top-4 left-4">
                  <span className="bg-google-blue text-white px-3 py-1 rounded-full text-sm font-medium">Nieuw</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Modern appartement met balkon</h3>
                <p className="text-gray-600 mb-4">Barcelona, Spanje</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 h-5 w-5 fill-current" />
                    <span>4.9 (23 reviews)</span>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/homes/2">Bekijk details</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Featured Listing 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative">
                <img src="/placeholder.svg?key=b3i4d" alt="Paris Apartment" className="w-full h-64 object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Charmant appartement met uitzicht</h3>
                <p className="text-gray-600 mb-4">Parijs, Frankrijk</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 h-5 w-5 fill-current" />
                    <span>4.7 (41 reviews)</span>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/homes/3">Bekijk details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Wat onze gebruikers zeggen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
              </div>
              <p className="text-gray-600 mb-6">
                "Dankzij SwapBnB hebben we een geweldige vakantie gehad in Barcelona zonder hotelkosten. Het was
                fantastisch om in een echt thuis te verblijven en de stad als locals te ervaren."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src="/professional-woman-headshot.png"
                    alt="Lisa de Vries"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">Lisa de Vries</p>
                  <p className="text-gray-500 text-sm">Amsterdam, Nederland</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
              </div>
              <p className="text-gray-600 mb-6">
                "We hebben ons huis geruild met een gezin uit Parijs. Onze kinderen vonden het geweldig om in een ander
                huis te verblijven en we hebben zoveel geld bespaard op accommodatie."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src="/professional-man-headshot.png" alt="Mark Jansen" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Mark Jansen</p>
                  <p className="text-gray-500 text-sm">Utrecht, Nederland</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
                <Star className="text-yellow-400 h-5 w-5 fill-current" />
              </div>
              <p className="text-gray-600 mb-6">
                "Als alleenstaande reiziger vond ik het altijd lastig om betaalbare accommodatie te vinden. Met SwapBnB
                kan ik nu op plekken komen die anders buiten mijn budget zouden vallen."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src="images/testimonial-3.png" alt="Emma Visser" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Emma Visser</p>
                  <p className="text-gray-500 text-sm">Rotterdam, Nederland</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-google-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Klaar om de wereld te ontdekken?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Voeg je woning toe aan SwapBnB en begin met het plannen van je volgende avontuur zonder accommodatiekosten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-google-blue hover:bg-gray-100">
              <Link href="/register">Registreer nu</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-blue-600">
              <Link href="/listings">Bekijk woningen</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
