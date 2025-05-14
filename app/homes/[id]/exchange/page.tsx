import { notFound } from "next/navigation"
import { ExchangeRequestForm } from "@/components/exchanges/exchange-request-form"

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

export default function ExchangeRequestPage({ params }: { params: { id: string } }) {
  const home = mockListings.find((listing) => listing.id === params.id)

  if (!home) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Huizenruil aanvragen</h1>
      <p className="text-gray-600 mb-8">
        Vul het onderstaande formulier in om een huizenruil aan te vragen voor {home.title} in {home.city}.
      </p>

      <ExchangeRequestForm home={home} />
    </div>
  )
}
