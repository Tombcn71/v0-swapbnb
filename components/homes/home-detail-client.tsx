"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Home } from "@/lib/types"
import { HomeAvailability } from "./home-availability"
import { HomeReviews } from "./home-reviews"
import { HomeContact } from "./home-contact"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PencilIcon } from "lucide-react"

interface HomeDetailClientProps {
  home: Home
  isOwner: boolean
}

export function HomeDetailClient({ home, isOwner }: HomeDetailClientProps) {
  const [activeTab, setActiveTab] = useState("details")
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <div className="relative h-[400px] w-full rounded-lg overflow-hidden mb-6">
            {home.imageUrl ? (
              <Image src={home.imageUrl || "/placeholder.svg"} alt={home.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{home.title}</h1>
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => router.push(`/homes/${home.id}/edit`)}
                className="flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Property
              </Button>
            )}
          </div>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Location</h2>
                  <p>{home.address}</p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p>{home.description}</p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Features</h2>
                  <ul className="grid grid-cols-2 gap-2">
                    <li>Bedrooms: {home.bedrooms}</li>
                    <li>Bathrooms: {home.bathrooms}</li>
                    <li>Max Guests: {home.maxGuests}</li>
                    <li>Price: ${home.pricePerNight} per night</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="availability" className="mt-6">
              <HomeAvailability homeId={home.id} isOwner={isOwner} />
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <HomeReviews homeId={home.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-1/3">
          <div className="sticky top-24 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Interested in this home?</h2>
            {activeTab !== "availability" ? (
              <div className="space-y-4">
                <p>Check availability and request an exchange.</p>
                <Button className="w-full" onClick={() => setActiveTab("availability")}>
                  Check Availability
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p>Contact the owner for more information.</p>
                <HomeContact homeId={home.id} ownerId={home.userId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
