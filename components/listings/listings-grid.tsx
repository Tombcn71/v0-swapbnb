"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Home, MapPin, User } from "lucide-react"
import { FavoriteButton } from "@/components/homes/favorite-button"

// Type definitie voor een woning
interface Listing {
  id: string
  title: string
  description: string
  address: string
  city: string
  postal_code: string
  bedrooms: number
  bathrooms: number
  max_guests: number
  amenities: Record<string, boolean>
  images: string[]
  rating?: number
  review_count?: number
  owner_name: string
  owner_profile_image?: string
}

export function ListingsGrid() {
  const [homes, setHomes] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHomes() {
      try {
        setLoading(true)
        const response = await fetch("/api/homes")

        if (!response.ok) {
          throw new Error(`Error fetching homes: ${response.status}`)
        }

        const data = await response.json()
        setHomes(data)
      } catch (err) {
        console.error("Error fetching homes:", err)
        setError("Er is een fout opgetreden bij het ophalen van de woningen.")
      } finally {
        setLoading(false)
      }
    }

    fetchHomes()
  }, [])

  if (loading) {
    return <div className="text-center py-10">Woningen laden...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  if (homes.length === 0) {
    return <div className="text-center py-10">Geen woningen gevonden. Voeg een woning toe om te beginnen.</div>
  }

  // Voorkom dat de Link component de FavoriteButton click event afvangt
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div>
      <p className="text-gray-600 mb-6">{homes.length} woningen gevonden</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homes.map((home) => (
          <Card key={home.id} className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
            <div className="relative h-48 w-full overflow-hidden">
              <Link href={`/homes/${home.id}`}>
                <Image
                  src={
                    home.images && home.images.length > 0
                      ? home.images[0]
                      : `/abstract-geometric-shapes.png?height=400&width=600&query=${home.title}`
                  }
                  alt={home.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              {/* Favoriet hartje */}
              <div className="absolute top-2 right-2 z-10" onClick={handleFavoriteClick}>
                <FavoriteButton homeId={home.id} className="bg-white/80 hover:bg-white" />
              </div>

              {/* Profielfoto in het hoekje - VEEL GROTER */}
              <div className="absolute bottom-2 left-2 z-10">
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                  {home.owner_profile_image ? (
                    <Image
                      src={home.owner_profile_image || "/placeholder.svg"}
                      alt={home.owner_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link href={`/homes/${home.id}`} className="block">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{home.title}</h3>
                  {home.rating && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm ml-1">{home.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{home.city}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{home.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center">
                    <Home className="h-3 w-3 mr-1" />
                    <span>
                      {home.bedrooms} slaapkamer{home.bedrooms !== 1 && "s"}
                    </span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>Max. {home.max_guests} gasten</span>
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {home.review_count ? `${home.review_count} beoordelingen` : `Aangeboden door ${home.owner_name}`}
                </div>
                <div className="text-blue-600 font-medium">Bekijk details</div>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
