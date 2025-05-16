"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HomeAvailability } from "@/components/homes/home-availability"
import { HomeReviews } from "@/components/homes/home-reviews"
import { HomeContact } from "@/components/homes/home-contact"
import type { Home } from "@/lib/types"
import { ChevronLeft, Wifi, Tv, Utensils, Thermometer, Waves, Edit, Trash2 } from "lucide-react"
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
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface HomeDetailClientProps {
  home: Home
  userId?: string
  isOwner?: boolean
}

export function HomeDetailClient({ home, userId, isOwner = false }: HomeDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Parse images if it's a string
  const parsedImages = typeof home.images === "string" ? JSON.parse(home.images) : home.images || []

  // Use the images array from the home data or a fallback
  const images = parsedImages.length > 0 ? parsedImages : ["/placeholder.svg?key=d9tko"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Parse amenities if it's a string
  const amenities = typeof home.amenities === "string" ? JSON.parse(home.amenities) : home.amenities || {}

  const handleDeleteHome = async () => {
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
        description: "Je woning is succesvol verwijderd",
      })

      router.push("/listings")
      router.refresh()
    } catch (error) {
      console.error("Error deleting home:", error)
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van de woning",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/listings">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Terug naar zoekresultaten
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{home.title}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <span>
                {home.address}, {home.city}
              </span>
              {home.rating && (
                <div className="flex items-center ml-4">
                  <span>{home.rating}</span>
                  <span className="mx-1">·</span>
                  <span>{home.reviewCount || 0} beoordelingen</span>
                </div>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/homes/${home.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Bewerken
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Verwijderen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Woning verwijderen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Weet je zeker dat je deze woning wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteHome}
                      className="bg-red-500 hover:bg-red-600"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Bezig met verwijderen..." : "Verwijderen"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative h-96 rounded-lg overflow-hidden">
          <Image
            src={
              images[currentImageIndex] ||
              `/abstract-geometric-shapes.png?height=800&width=1200&query=${home.title || "/placeholder.svg"} main`
            }
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
                src={`/abstract-geometric-shapes.png?height=100&width=100&query=${home.host_name}`}
                alt={home.host_name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold">Woning van {home.host_name}</h2>
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
                <span>
                  {home.bedrooms} slaapkamer{home.bedrooms !== 1 && "s"}
                </span>
              </div>
              <div className="flex items-center">
                <span>
                  {home.bathrooms} badkamer{home.bathrooms !== 1 && "s"}
                </span>
              </div>
              <div className="flex items-center">
                <span>Max. {home.max_guests} gasten</span>
              </div>
              <div className="flex items-center">
                <span>{home.city}</span>
              </div>
              {amenities.wifi && (
                <div className="flex items-center">
                  <Wifi className="h-5 w-5 text-gray-600 mr-3" />
                  <span>WiFi</span>
                </div>
              )}
              {amenities.tv && (
                <div className="flex items-center">
                  <Tv className="h-5 w-5 text-gray-600 mr-3" />
                  <span>TV</span>
                </div>
              )}
              {amenities.kitchen && (
                <div className="flex items-center">
                  <Utensils className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Keuken</span>
                </div>
              )}
              {amenities.heating && (
                <div className="flex items-center">
                  <Thermometer className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Verwarming</span>
                </div>
              )}
              {amenities.airconditioning && (
                <div className="flex items-center">
                  <Waves className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Airconditioning</span>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="availability" className="mb-8">
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
