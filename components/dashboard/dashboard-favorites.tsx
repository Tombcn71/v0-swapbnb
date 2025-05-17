"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/homes/favorite-button"
import { BedDouble, Bath } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DashboardFavorites() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch("/api/favorites")
        if (response.ok) {
          const data = await response.json()
          setFavorites(data)
        } else {
          throw new Error("Kon favorieten niet ophalen")
        }
      } catch (error: any) {
        toast({
          title: "Fout bij het ophalen van favorieten",
          description: error.message || "Er is een fout opgetreden",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [toast])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Je hebt nog geen woningen aan je favorieten toegevoegd.</p>
        <Button asChild>
          <Link href="/homes">Bekijk woningen</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite) => {
        // Parse images if needed
        const images = Array.isArray(favorite.images)
          ? favorite.images
          : typeof favorite.images === "string"
            ? JSON.parse(favorite.images)
            : []

        const firstImage = images.length > 0 ? images[0] : null

        return (
          <Card key={favorite.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={firstImage || `/abstract-geometric-shapes.png?height=400&width=600&query=${favorite.title}`}
                alt={favorite.title}
                fill
                className="object-cover"
              />
              <FavoriteButton homeId={favorite.home_id} className="absolute top-2 right-2 bg-white/80 hover:bg-white" />
            </div>
            <CardContent className="p-4">
              <Link href={`/homes/${favorite.home_id}`}>
                <h3 className="font-semibold text-lg mb-1 hover:text-blue-600 transition-colors">{favorite.title}</h3>
              </Link>
              <p className="text-gray-500 text-sm mb-3">{favorite.city}</p>
              <div className="flex justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <BedDouble className="h-4 w-4 mr-1" />
                  <span>{favorite.bedrooms} slaapkamers</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{favorite.bathrooms} badkamers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
