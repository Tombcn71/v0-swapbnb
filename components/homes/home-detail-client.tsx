"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HomeAvailability } from "@/components/homes/home-availability"
import { HomeReviews } from "@/components/homes/home-reviews"
import { HomeContact } from "@/components/homes/home-contact"
import type { Home } from "@/lib/types"
import { ChevronLeft, Wifi, Tv, Utensils, Thermometer, Waves, PencilIcon, Trash2 } from "lucide-react"
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

  // Use the images array from the home data or a fallback
  const images = home.images && home.images.length > 0 ? home.images : ["/placeholder.svg?key=d9tko"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const amenities = home.amenities || {}

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
        title: "Home deleted",
        description: "Your home has been successfully deleted",
      })

      router.push("/listings")
      router.refresh()
    } catch (error) {
      console.error("Error deleting home:", error)
      toast({
        title: "Error deleting home",
        description: "There was an error deleting your home",
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
            Back to listings
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
                  <span>{home.reviewCount || 0} reviews</span>
                </div>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/homes/${home.id}/edit`}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Home</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this home? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteHome}
                      className="bg-red-500 hover:bg-red-600"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
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
              alt={`${home.title} - Living room`}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative h-44 rounded-lg overflow-hidden">
            <Image
              src={images[2] || `/abstract-geometric-shapes.png?height=400&width=600&query=${home.title} bedroom`}
              alt={`${home.title} - Bedroom`}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative h-44 rounded-lg overflow-hidden">
            <Image
              src={images[3] || `/abstract-geometric-shapes.png?height=400&width=600&query=${home.title} kitchen`}
              alt={`${home.title} - Kitchen`}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative h-44 rounded-lg overflow-hidden">
            <Image
              src={images[4] || `/abstract-geometric-shapes.png?height=400&width=600&query=${home.title} bathroom`}
              alt={`${home.title} - Bathroom`}
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
                src={`/abstract-geometric-shapes.png?height=100&width=100&query=${home.ownerName}`}
                alt={home.ownerName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold">Home by {home.ownerName}</h2>
              <p className="text-gray-600 text-sm">
                {home.bedrooms} bedroom{home.bedrooms !== 1 && "s"} · {home.bathrooms} bathroom
                {home.bathrooms !== 1 && "s"} · Max. {home.maxGuests} guests
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">About this home</h2>
            <p className="text-gray-700 mb-4">{home.description}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <span>
                  {home.bedrooms} bedroom{home.bedrooms !== 1 && "s"}
                </span>
              </div>
              <div className="flex items-center">
                <span>
                  {home.bathrooms} bathroom{home.bathrooms !== 1 && "s"}
                </span>
              </div>
              <div className="flex items-center">
                <span>Max. {home.maxGuests} guests</span>
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
                  <span>Kitchen</span>
                </div>
              )}
              {amenities.heating && (
                <div className="flex items-center">
                  <Thermometer className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Heating</span>
                </div>
              )}
              {amenities.airconditioning && (
                <div className="flex items-center">
                  <Waves className="h-5 w-5 text-gray-600 mr-3" />
                  <span>Air conditioning</span>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="availability" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
