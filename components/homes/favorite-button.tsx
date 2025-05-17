"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
  homeId: string
  className?: string
}

export function FavoriteButton({ homeId, className = "" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()

  // Haal de favoriete status op
  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false)
      return
    }

    async function checkFavoriteStatus() {
      try {
        const response = await fetch(`/api/favorites/check?homeId=${homeId}`)
        if (response.ok) {
          const data = await response.json()
          setIsFavorite(data.isFavorite)
        }
      } catch (error) {
        console.error("Error checking favorite status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkFavoriteStatus()
  }, [homeId, session])

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast({
        title: "Je bent niet ingelogd",
        description: "Log in om woningen aan je favorieten toe te voegen",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ homeId }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.isFavorite)
        toast({
          title: data.isFavorite ? "Toegevoegd aan favorieten" : "Verwijderd uit favorieten",
          description: data.message,
        })
        // Refresh de pagina om de UI bij te werken
        router.refresh()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Er is een fout opgetreden")
      }
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full ${className}`}
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
    >
      <Heart className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
    </Button>
  )
}
