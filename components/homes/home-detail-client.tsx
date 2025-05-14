"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { HomeAvailability } from "@/components/homes/home-availability"
import { HomeReviews } from "@/components/homes/home-reviews"
import { HomeContact } from "@/components/homes/home-contact"
import {
  MapPin,
  Users,
  Bed,
  Bath,
  HomeIcon,
  Wifi,
  Car,
  TreePine,
  Utensils,
  Tv,
  Wind,
  ArrowLeft,
  Star,
  Loader2,
} from "lucide-react"

interface HomeDetailClientProps {
  homeId: string
}

export function HomeDetailClient({ homeId }: HomeDetailClientProps) {
  const [home, setHome] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHome() {
      try {
        setLoading(true)
        const res = await fetch(`/api/homes/${homeId}`)

        if (!res.ok) {
          throw new Error(`Failed to fetch home: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        setHome(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching home:", err)
        setError("Er is een fout opgetreden bij het ophalen van de woning. Probeer het later opnieuw.")
      } finally {
        setLoading(false)
      }
    }

    fetchHome()
  }, [homeId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-500">Woning wordt geladen...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 mb-4">{error}</p>
        <Button asChild>
          <Link href="/listings">Terug naar woningen</Link>
        </Button>
      </div>
    )
  }

  if (!home) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 mb-4">Woning niet gevonden</p>
        <Button asChild>
          <Link href="/listings">Terug naar woningen</Link>
        </Button>
      </div>
    )
  }

  // Parse amenities als het een string is
  const amenities = typeof home.amenities === "string" ? JSON.parse(home.amenities) : home.amenities || {}

  // Parse images als het een string is
  const images = typeof home.images === "string" ? JSON.parse(home.images) : home.images || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/listings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar zoekresultaten
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">{home.title}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span>
            {home.address}, {home.city}
          </span>
          {home.rating && (
            <div className="flex items-center ml-4">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span>{home.rating}</span>
              <span className="mx-1">·</span>
              <span>{home.reviewCount || 0} beoordelingen</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative h-96 rounded-lg overflow-hidden">
          <Image
            src={images[0] || `/abstract-geometric-shapes.png?height=800&width=1200&query=${home.title} main`}
            alt={home.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative h-44 rounded-lg overflow-hidden">
            <Image
              src={images[1] || `/abstract-geometric-shapes.png?height=400&width=600&query=${home.title} living`}
              alt={`${home.title} - Woonkamer`}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative h-44 rounded-lg overflow-hidden">
            <Image
              src={images[2] || `/abstract-geometric-shapes.png?height=400&width=600&query=${home.title} bedroom`}
              alt={`${home.title} - Slaapkamer`}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative h-44 rounded-lg overflow-hidden">
            <Image
              src={images[3] || `/abstract-geometric-shapes.png?height=400&width=600&query=${home.title} kitchen`}
              alt={`${home.title} - Keuken`}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative h-44 rounded-lg overflow-hidden">
            <Image
              src={images[4] || `/abstract-geometric-shapes.png?height=400&width=600&query=${home.title} bathroom`}
              alt={`${home.title} - Badkamer`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center mb-6">
            <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
              <Image
                src={home.owner_image || "/placeholder.svg?height=100&width=100&query=user"}
                alt={home.owner_name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold">Woning van {home.owner_name}</h2>
              <p className="text-gray-600 text-sm">
                {home.bedrooms} slaapkamer{home.bedrooms !== 1 && "s"} · {home.bathrooms} badkamer
                {home.bathrooms !== 1 && "s"} · Max. {home.max_guests} gasten
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Over deze woning</h2>
            <p className="text-gray-700 mb-4">{home.description}</p>
            <p className="text-gray-700">
              Deze woning is perfect voor een verblijf in {home.city} en biedt alle comfort die je nodig hebt. De
              locatie is ideaal om de stad te verkennen en te genieten van alles wat {home.city} te bieden heeft.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Kenmerken</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Bed className="h-5 w-5 text-gray-600 mr-3" />
                <span>
                  {home.bedrooms} slaapkamer{home.bedrooms !== 1 && "s"}
                </span>
              </div>
              <div className="flex items-center">
                <Bath className="h-5 w-5 text-gray-600 mr-3" />
                <span>
                  {home.bathrooms} badkamer{home.bathrooms !== 1 && "s"}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-600 mr-3" />
                <span>Max. {home.max_guests} gasten</span>
              </div>
              <div className="flex items-center">
                <HomeIcon className="h-5 w-5 text-gray-600 mr-3" />
                <span>{home.city}</span>
              </div>
              {amenities.wifi && (
                <div className="flex items-center">
                  <Wifi className="h-5 w-5 text-gray-600 mr-3" />
                  <span>WiFi</span>
                </div>
              )}
              {amenities.parking && (
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Parkeerplaats</span>
                </div>
              )}
              {amenities.garden && (
                <div className="flex items-center">
                  <TreePine className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Tuin</span>
                </div>
              )}
              {amenities.kitchen && (
                <div className="flex items-center">
                  <Utensils className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Keuken</span>
                </div>
              )}
              {amenities.tv && (
                <div className="flex items-center">
                  <Tv className="h-5 w-5 text-gray-600 mr-3" />
                  <span>TV</span>
                </div>
              )}
              {amenities.airconditioning && (
                <div className="flex items-center">
                  <Wind className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Airconditioning</span>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="availability" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="availability">Beschikbaarheid</TabsTrigger>
              <TabsTrigger value="reviews">Beoordelingen</TabsTrigger>
              <TabsTrigger value="location">Locatie</TabsTrigger>
            </TabsList>
            <TabsContent value="availability">
              <HomeAvailability homeId={home.id} />
            </TabsContent>
            <TabsContent value="reviews">
              <HomeReviews homeId={home.id} rating={home.rating} reviewCount={home.reviews?.length || 0} />
            </TabsContent>
            <TabsContent value="location">
              <div className="rounded-lg overflow-hidden border h-96 relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">
                    Kaart van {home.city} - {home.address}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Geïnteresseerd in deze woning?</h3>
              <p className="text-gray-600 mb-6">
                Neem contact op met {home.owner_name} om de mogelijkheden voor een huizenruil te bespreken.
              </p>
              <HomeContact ownerId={home.user_id} ownerName={home.owner_name} homeId={home.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
