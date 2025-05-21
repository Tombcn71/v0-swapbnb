"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HomeContact } from "@/components/homes/home-contact"
import { HomeAmenities } from "@/components/homes/home-amenities"
import { HomeGallery } from "@/components/homes/home-gallery"
import { HomeMap } from "@/components/homes/home-map"
import { HomeReviews } from "@/components/homes/home-reviews"
import type { HomeType } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HomeExchanges } from "@/components/homes/home-exchanges"
import { HomeAvailability } from "@/components/homes/home-availability"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function HomeDetailClient({
  home,
  userId,
  isOwner,
}: {
  home: HomeType
  userId?: string
  isOwner: boolean
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!isOwner) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/homes/${home.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete home")
      }

      toast({
        title: "Woning verwijderd",
        description: "Je woning is succesvol verwijderd.",
      })
      router.push("/")
    } catch (error) {
      console.error("Error deleting home:", error)
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van je woning.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl md:text-3xl">{home.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {home.city} • {home.bedrooms} slaapkamers • {home.max_guests} gasten
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-2">
                    <AvatarImage
                      src={home.owner_profile_image || "/placeholder.svg?height=50&width=50&query=user"}
                      alt={home.owner_name || "Eigenaar"}
                    />
                    <AvatarFallback>{home.owner_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{home.owner_name || "Eigenaar"}</p>
                    <p className="text-xs text-muted-foreground">Eigenaar</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <HomeGallery images={home.images} />
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Beschrijving</h3>
                <p className="text-gray-700">{home.description}</p>
              </div>
            </CardContent>
            {isOwner && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/homes/${home.id}/edit`)}>
                  Bewerken
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      {isDeleting ? "Bezig met verwijderen..." : "Verwijderen"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Deze actie kan niet ongedaan worden gemaakt. Dit zal je woning permanent verwijderen uit ons
                        systeem.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuleren</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Verwijderen</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            )}
          </Card>

          <Tabs defaultValue="details" className="mb-8">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="amenities">Voorzieningen</TabsTrigger>
              <TabsTrigger value="availability">Beschikbaarheid</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Woningdetails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Adres</p>
                      <p className="text-sm text-gray-500">{home.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Stad</p>
                      <p className="text-sm text-gray-500">{home.city}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Postcode</p>
                      <p className="text-sm text-gray-500">{home.postal_code}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Slaapkamers</p>
                      <p className="text-sm text-gray-500">{home.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Badkamers</p>
                      <p className="text-sm text-gray-500">{home.bathrooms}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Max. gasten</p>
                      <p className="text-sm text-gray-500">{home.max_guests}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <HomeMap address={`${home.address}, ${home.city}, ${home.postal_code}`} />
            </TabsContent>
            <TabsContent value="amenities">
              <HomeAmenities amenities={home.amenities} />
            </TabsContent>
            <TabsContent value="availability">
              <HomeAvailability homeId={home.id} />
            </TabsContent>
            <TabsContent value="reviews">
              <HomeReviews homeId={home.id} />
            </TabsContent>
          </Tabs>

          {isOwner && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Ruilverzoeken</CardTitle>
                <CardDescription>Bekijk en beheer ruilverzoeken voor je woning</CardDescription>
              </CardHeader>
              <CardContent>
                <HomeExchanges homeId={home.id} isOwner={true} />
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <HomeContact home={home} userId={userId} />

          {userId && !isOwner && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ruilgeschiedenis</CardTitle>
                <CardDescription>Je eerdere ruilverzoeken voor deze woning</CardDescription>
              </CardHeader>
              <CardContent>
                <HomeExchanges homeId={home.id} userId={userId} isOwner={false} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
