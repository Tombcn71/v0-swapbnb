"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HomeGallery } from "@/components/homes/home-gallery"
import { HomeAmenities } from "@/components/homes/home-amenities"
import { HomeAvailability } from "@/components/homes/home-availability"
import { HomeReviews } from "@/components/homes/home-reviews"
import { HomeMap } from "@/components/homes/home-map"
import { FavoriteButton } from "@/components/homes/favorite-button"
import { HomeContact } from "@/components/homes/home-contact"
import { MapPin, Users, BedDouble, Bath, Car, MessageSquare, RefreshCw } from "lucide-react"
import type { Home as HomeType } from "@/lib/types"
import type { Session } from "next-auth"

interface HomeDetailClientProps {
  home: HomeType & {
    owner_name: string
    owner_email: string
    owner_image: string | null
  }
  session: Session | null
}

export function HomeDetailClient({ home, session }: HomeDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Parse images if they're stored as JSON string
  const images = Array.isArray(home.images)
    ? home.images
    : typeof home.images === "string"
      ? JSON.parse(home.images)
      : []

  const isOwner = session?.user?.id === home.user_id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{home.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {home.city}, {home.country}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton homeId={home.id} />
              {isOwner && (
                <Button variant="outline" asChild>
                  <Link href={`/homes/${home.id}/edit`}>Bewerk</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Gallery */}
          <HomeGallery images={images} title={home.title} />

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-600" />
              <span>{home.max_guests} gasten</span>
            </div>
            <div className="flex items-center">
              <BedDouble className="h-5 w-5 mr-2 text-gray-600" />
              <span>{home.bedrooms} slaapkamers</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-5 w-5 mr-2 text-gray-600" />
              <span>{home.bathrooms} badkamers</span>
            </div>
            {home.parking && (
              <div className="flex items-center">
                <Car className="h-5 w-5 mr-2 text-gray-600" />
                <span>Parkeren</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8">
              {[
                { id: "overview", label: "Overzicht" },
                { id: "amenities", label: "Voorzieningen" },
                { id: "availability", label: "Beschikbaarheid" },
                { id: "reviews", label: "Reviews" },
                { id: "location", label: "Locatie" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Beschrijving</h3>
                  <p className="text-gray-700 leading-relaxed">{home.description}</p>
                </div>

                {home.house_rules && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Huisregels</h3>
                    <p className="text-gray-700">{home.house_rules}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "amenities" && <HomeAmenities amenities={home.amenities} />}
            {activeTab === "availability" && <HomeAvailability homeId={home.id} />}
            {activeTab === "reviews" && <HomeReviews homeId={home.id} />}
            {activeTab === "location" && (
              <HomeMap latitude={home.latitude} longitude={home.longitude} title={home.title} city={home.city} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eigenaar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={
                      home.owner_image || `/portrait-of-a-young-man.png?height=100&width=100&query=${home.owner_name}`
                    }
                    alt={home.owner_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{home.owner_name}</h4>
                  <p className="text-sm text-gray-600">Eigenaar sinds 2023</p>
                </div>
              </div>

              {!isOwner && session?.user && (
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href={`/homes/${home.id}/exchange`}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Swap aanvragen
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/messages/${home.user_id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Stuur bericht
                    </Link>
                  </Button>
                </div>
              )}

              {!session?.user && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Log in om contact op te nemen</p>
                  <Button asChild className="w-full">
                    <Link href="/login">Inloggen</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Form - only show for logged in users who are not the owner */}
          {session?.user && !isOwner && <HomeContact homeId={home.id} ownerId={home.user_id} />}
        </div>
      </div>
    </div>
  )
}
