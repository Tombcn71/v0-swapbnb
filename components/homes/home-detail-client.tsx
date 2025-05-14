"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HomeAvailability } from "@/components/homes/home-availability"
import { HomeReviews } from "@/components/homes/home-reviews"
import { HomeContact } from "@/components/homes/home-contact"
import type { Home } from "@/lib/types"
import { ChevronLeft, ChevronRight, Wifi, Tv, Utensils, Thermometer, Waves } from "lucide-react"

interface HomeDetailClientProps {
  home: Home
  userId?: string
}

export function HomeDetailClient({ home, userId }: HomeDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Gebruik de images array uit de home data of een fallback
  const images = home.images && home.images.length > 0 ? home.images : ["/placeholder.svg?key=d9tko"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const amenities = home.amenities || {}

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{home.title}</h1>

      {/* Afbeeldingen carousel */}
      <div className="relative mb-8 rounded-lg overflow-hidden">
        <div className="aspect-w-16 aspect-h-9 relative h-[400px] md:h-[500px]">
          <Image
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={`${home.title} - Afbeelding ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Woning in {home.city} gehost door {home.userName}
                  </h2>
                  <p className="text-gray-500">
                    {home.bedrooms} slaapkamer{home.bedrooms !== 1 ? "s" : ""} · {home.bathrooms} badkamer
                    {home.bathrooms !== 1 ? "s" : ""} · Max {home.maxGuests} gast{home.maxGuests !== 1 ? "en" : ""}
                  </p>
                </div>
              </div>

              <div className="border-t border-b py-4 my-4">
                <h3 className="font-medium mb-2">Voorzieningen</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
                  {amenities.wifi && (
                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 mr-2" />
                      <span>WiFi</span>
                    </div>
                  )}
                  {amenities.tv && (
                    <div className="flex items-center">
                      <Tv className="h-4 w-4 mr-2" />
                      <span>TV</span>
                    </div>
                  )}
                  {amenities.kitchen && (
                    <div className="flex items-center">
                      <Utensils className="h-4 w-4 mr-2" />
                      <span>Keuken</span>
                    </div>
                  )}
                  {amenities.heating && (
                    <div className="flex items-center">
                      <Thermometer className="h-4 w-4 mr-2" />
                      <span>Verwarming</span>
                    </div>
                  )}
                  {amenities.airconditioning && (
                    <div className="flex items-center">
                      <Waves className="h-4 w-4 mr-2" />
                      <span>Airconditioning</span>
                    </div>
                  )}
                  {/* Andere voorzieningen als badges tonen */}
                  <div className="col-span-2 md:col-span-3 mt-2 flex flex-wrap gap-2">
                    {Object.entries(amenities)
                      .filter(
                        ([key, value]) =>
                          value === true && !["wifi", "tv", "kitchen", "heating", "airconditioning"].includes(key),
                      )
                      .map(([key]) => (
                        <Badge key={key} variant="outline">
                          {key === "washer"
                            ? "Wasmachine"
                            : key === "dryer"
                              ? "Droger"
                              : key === "parking"
                                ? "Parkeerplaats"
                                : key === "elevator"
                                  ? "Lift"
                                  : key === "garden"
                                    ? "Tuin"
                                    : key === "bbq"
                                      ? "BBQ"
                                      : key === "pets"
                                        ? "Huisdieren toegestaan"
                                        : key}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Beschrijving</h3>
                <p className="text-gray-700 whitespace-pre-line">{home.description}</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="availability">
            <TabsList className="mb-4">
              <TabsTrigger value="availability">Beschikbaarheid</TabsTrigger>
              <TabsTrigger value="reviews">Beoordelingen</TabsTrigger>
            </TabsList>
            <TabsContent value="availability">
              <HomeAvailability homeId={home.id} />
            </TabsContent>
            <TabsContent value="reviews">
              <HomeReviews homeId={home.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <HomeContact home={home} userId={userId} />
        </div>
      </div>
    </div>
  )
}
