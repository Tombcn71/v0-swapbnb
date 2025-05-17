"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HomeAvailability } from "./home-availability"
import { HomeReviews } from "./home-reviews"
import { HomeContact } from "./home-contact"
import { FavoriteButton } from "./favorite-button"
import { PencilIcon, BedIcon, BathIcon, UsersIcon, MapPinIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HomeDetailClientProps {
  home: any
  userId: string | undefined
  isOwner: boolean
}

export function HomeDetailClient({ home, userId, isOwner }: HomeDetailClientProps) {
  const [activeImage, setActiveImage] = useState(0)
  const { toast } = useToast()

  // Ensure we have the home ID as a string
  const homeId = home?.id?.toString() || ""

  // Parse images if needed
  const images = Array.isArray(home.images)
    ? home.images
    : typeof home.images === "string"
      ? JSON.parse(home.images)
      : []

  // Log for debugging
  useEffect(() => {
    console.log("HomeDetailClient - home object:", home)
    console.log("HomeDetailClient - homeId:", homeId)
    console.log("HomeDetailClient - host_profile_image:", home.host_profile_image)

    if (!homeId) {
      console.error("HomeDetailClient - No homeId available")
      toast({
        title: "Fout",
        description: "Woning ID ontbreekt. Probeer de pagina te vernieuwen.",
        variant: "destructive",
      })
    }
  }, [home, homeId, toast])

  // If no homeId is available, show an error message
  if (!homeId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Fout: </strong>
          <span className="block sm:inline">Woning ID ontbreekt. Probeer de pagina te vernieuwen.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{home.title}</h1>
          {home.host_profile_image && (
            <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
              <Image
                src={home.host_profile_image || "/placeholder.svg"}
                alt={home.host_name || ""}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isOwner && <FavoriteButton homeId={homeId} />}
          {isOwner && (
            <Link href={`/homes/${homeId}/edit`}>
              <Button variant="outline" className="flex items-center gap-2">
                <PencilIcon className="h-4 w-4" />
                Bewerken
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[activeImage] || "/placeholder.svg"}
                  alt={home.title}
                  width={800}
                  height={500}
                  className="rounded-lg object-cover w-full h-[500px]"
                />
                {!isOwner && (
                  <FavoriteButton homeId={homeId} className="absolute top-4 right-4 bg-white/80 hover:bg-white" />
                )}
              </>
            ) : (
              <div className="bg-gray-200 rounded-lg w-full h-[500px] flex items-center justify-center">
                <p className="text-gray-500">Geen afbeelding beschikbaar</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {images.slice(1, 5).map((image: string, index: number) => (
              <div key={index} className="cursor-pointer" onClick={() => setActiveImage(index + 1)}>
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${home.title} - ${index + 1}`}
                  width={400}
                  height={300}
                  className="rounded-lg object-cover w-full h-[150px]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="availability">Beschikbaarheid</TabsTrigger>
              <TabsTrigger value="reviews">Beoordelingen</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Over deze woning</h2>
                <p className="text-gray-700">{home.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Kenmerken</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <BedIcon className="h-5 w-5 text-gray-500" />
                    <span>{home.bedrooms} slaapkamers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BathIcon className="h-5 w-5 text-gray-500" />
                    <span>{home.bathrooms} badkamers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                    <span>Max {home.max_guests} gasten</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Voorzieningen</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {home.amenities &&
                    Object.entries(home.amenities).map(
                      ([key, value]: [string, any]) =>
                        value && (
                          <div key={key} className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="capitalize">{key.replace("_", " ")}</span>
                          </div>
                        ),
                    )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Locatie</h2>
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <p>{home.address}</p>
                    <p>
                      {home.postal_code}, {home.city}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="availability">
              <HomeAvailability homeId={homeId} isOwner={isOwner} />
            </TabsContent>
            <TabsContent value="reviews">
              <HomeReviews homeId={homeId} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <HomeContact home={home} userId={userId} isOwner={isOwner} hostImage={home.host_profile_image} />
        </div>
      </div>
    </div>
  )
}
