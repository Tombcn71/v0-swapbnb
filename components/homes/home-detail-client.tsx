"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HomeGallery } from "./home-gallery"
import { HomeAmenities } from "./home-amenities"
import { HomeAvailability } from "./home-availability"
import { HomeReviews } from "./home-reviews"
import { HomeMap } from "./home-map"
import { FavoriteButton } from "./favorite-button"
import { HomeContact } from "./home-contact"
import { MapPin, Users, Bed, Bath, Car, Wifi, Tv, Coffee, Waves, TreePine, Star, ArrowLeft } from "lucide-react"
import type { Home, User, Review, Availability } from "@/lib/types"

interface HomeDetailClientProps {
  home: Home & { owner_name: string; owner_email: string; owner_image: string | null }
  owner: User
  reviews: Review[]
  availabilities: Availability[]
}

export function HomeDetailClient({ home, owner, reviews, availabilities }: HomeDetailClientProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")

  const isOwner = session?.user?.id === home.user_id

  const averageRating =
    reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0

  const amenityIcons = {
    wifi: Wifi,
    tv: Tv,
    kitchen: Coffee,
    parking: Car,
    pool: Waves,
    garden: TreePine,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/listings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar overzicht
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{home.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {home.city}, {home.country}
                    </span>
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{averageRating.toFixed(1)}</span>
                      <span className="text-gray-600 ml-1">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
                <FavoriteButton homeId={home.id} />
              </div>

              {/* Quick info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{home.max_guests} gasten</span>
                </div>
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{home.bedrooms} slaapkamers</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{home.bathrooms} badkamers</span>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <HomeGallery images={home.images || []} title={home.title} />

            {/* Navigation tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
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
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            <div className="mt-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Beschrijving</h3>
                    <p className="text-gray-700 leading-relaxed">{home.description}</p>
                  </div>

                  {home.house_rules && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Huisregels</h3>
                      <p className="text-gray-700">{home.house_rules}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "amenities" && <HomeAmenities amenities={home.amenities || []} />}

              {activeTab === "availability" && <HomeAvailability availabilities={availabilities} />}

              {activeTab === "reviews" && <HomeReviews reviews={reviews} />}

              {activeTab === "location" && <HomeMap address={`${home.address}, ${home.city}, ${home.country}`} />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eigenaar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={owner.image || undefined} />
                    <AvatarFallback>{owner.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{owner.name}</p>
                    <p className="text-sm text-gray-600">Eigenaar sinds 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact form - only show if not owner */}
            {!isOwner && <HomeContact homeId={home.id} ownerId={home.user_id} />}

            {/* Owner actions */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Beheer je woning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href={`/homes/${home.id}/edit`}>Bewerk woning</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/homes/${home.id}/availability`}>Beheer beschikbaarheid</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
