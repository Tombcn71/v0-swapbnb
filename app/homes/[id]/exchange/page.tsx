import { notFound } from "next/navigation"
import { SwapRequestForm } from "@/components/exchanges/swap-request-form"
import Script from "next/script"

// Dit zou normaal gesproken uit de database komen
const mockListings = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    title: "Modern Appartement in Amsterdam Centrum",
    description: "Ruim en licht appartement in het hart van Amsterdam. Op loopafstand van alle bezienswaardigheden.",
    address: "Herengracht 123",
    city: "Amsterdam",
    postalCode: "1015 BR",
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    amenities: {
      wifi: true,
      kitchen: true,
      heating: true,
      tv: true,
      washer: true,
      airconditioning: false,
      parking: false,
      elevator: true,
    },
    images: ["apartment1.jpg", "apartment1_living.jpg", "apartment1_bedroom.jpg"],
    rating: 4.8,
    reviewCount: 24,
    owner: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Jan de Vries",
      image: "/placeholder.svg?key=uyhr9",
    },
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    title: "Gezellig Rijtjeshuis in Utrecht",
    description: "Comfortabel gezinshuis in een rustige wijk van Utrecht. Ideaal voor gezinnen met kinderen.",
    address: "Maliebaan 45",
    city: "Utrecht",
    postalCode: "3581 CD",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 5,
    amenities: {
      wifi: true,
      kitchen: true,
      heating: true,
      tv: true,
      washer: true,
      dryer: true,
      parking: true,
      garden: true,
      bbq: true,
    },
    images: ["house1.jpg", "house1_living.jpg", "house1_garden.jpg"],
    rating: 4.9,
    reviewCount: 18,
    owner: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Emma Bakker",
      image: "/emma-portrait.png",
    },
  },
]

export default async function ExchangePage({ params }: { params: { id: string } }) {
  const targetHome = mockListings.find((listing) => listing.id === params.id)

  if (!targetHome) {
    notFound()
  }

  // Mock user homes (replace with actual data fetching)
  const userHomes = [
    {
      id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      title: "Knus Appartement in Rotterdam",
      description: "Leuk appartement met uitzicht op de Maas.",
      address: "Boompjes 200",
      city: "Rotterdam",
      postalCode: "3011 XZ",
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
    },
  ]

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Huizenruil aanvragen</h1>
        <p className="text-gray-600 mb-8">
          Vul het onderstaande formulier in om een huizenruil aan te vragen voor {targetHome.title} in {targetHome.city}
          .
        </p>

        <SwapRequestForm targetHome={targetHome} userHomes={userHomes} />
      </div>

      {/* Script toevoegen dat de modal direct in de DOM injecteert */}
      <Script src="/credit-modal.js" strategy="afterInteractive" />
    </div>
  )
}
