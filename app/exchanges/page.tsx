"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, MessageCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

interface Exchange {
  id: string
  requester_id: string
  host_id: string
  requester_home_id: string
  host_home_id: string
  start_date: string
  end_date: string
  guests: number
  message?: string
  status: string
  created_at: string

  // Extended info
  requester_home_title?: string
  requester_home_city?: string
  requester_home_images?: string | string[]
  host_home_title?: string
  host_home_city?: string
  host_home_images?: string | string[]
  requester_name?: string
  requester_email?: string
  requester_profile_image?: string
  host_name?: string
  host_email?: string
  host_profile_image?: string
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">⏳ In behandeling</Badge>
    case "accepted":
      return <Badge className="bg-blue-100 text-blue-800">💬 In gesprek</Badge>
    case "videocall_scheduled":
      return <Badge className="bg-purple-100 text-purple-800">📹 Videocall gepland</Badge>
    case "videocall_completed":
      return <Badge className="bg-teal-100 text-teal-800">✓ Kennismaking voltooid</Badge>
    case "rejected":
      return <Badge className="bg-red-100 text-red-800">✗ Geweigerd</Badge>
    case "confirmed":
      return <Badge className="bg-green-100 text-green-800">🎉 Bevestigd</Badge>
    case "cancelled":
      return <Badge className="bg-gray-100 text-gray-800">✗ Geannuleerd</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

const ExchangeCard = ({ exchange, currentUserId }: { exchange: Exchange; currentUserId: string }) => {
  const isRequester = exchange.requester_id === currentUserId

  // Determine which home and owner to show
  const homeTitle = isRequester ? exchange.host_home_title : exchange.requester_home_title
  const homeCity = isRequester ? exchange.host_home_city : exchange.requester_home_city
  const homeImages = isRequester ? exchange.host_home_images : exchange.requester_home_images
  const ownerName = isRequester ? exchange.host_name : exchange.requester_name
  const ownerImage = isRequester ? exchange.host_profile_image : exchange.requester_profile_image

  // Get first image or use placeholder
  let firstImage = ""
  if (homeImages) {
    if (Array.isArray(homeImages)) {
      firstImage = homeImages[0] || ""
    } else if (typeof homeImages === "string") {
      try {
        // Try to parse if it's a JSON string
        const parsed = JSON.parse(homeImages)
        firstImage = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : ""
      } catch (e) {
        // If not JSON, use as is
        firstImage = homeImages
      }
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Link href={`/exchanges/${exchange.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden">
        <div className="relative h-48 w-full">
          <Image
            src={firstImage || `/placeholder.svg?height=300&width=400&query=${homeTitle}`}
            alt={homeTitle || "Woning"}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 right-3">{getStatusBadge(exchange.status)}</div>
          <div className="absolute top-3 left-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              <AvatarImage src={ownerImage || ""} alt={ownerName || ""} />
              <AvatarFallback className="bg-teal-500 text-white">{getInitials(ownerName || "?")}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{homeTitle}</h3>
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{homeCity}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {format(new Date(exchange.start_date), "d MMM", { locale: nl })} -{" "}
                  {format(new Date(exchange.end_date), "d MMM yyyy", { locale: nl })}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                <span>{exchange.guests} gasten</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Met {ownerName}</div>
              <div className="flex items-center text-teal-600 text-sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>Bekijk conversatie</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const ExchangesPage = () => {
  const [exchanges, setExchanges] = useState<Exchange[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
    const fetchExchanges = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/exchanges")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log("Fetched exchanges data:", data) // Debug log
        setExchanges(data)

        // Get current user ID from session
        const sessionRes = await fetch("/api/auth/session")
        const sessionData = await sessionRes.json()
        setCurrentUserId(sessionData?.user?.id || "")
      } catch (error) {
        console.error("Failed to fetch exchanges:", error)
        setExchanges([])
      } finally {
        setLoading(false)
      }
    }

    fetchExchanges()
  }, [])

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Mijn Swaps</h1>
        <div className="flex items-center text-gray-600">
          <MessageCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">{exchanges === null ? "Laden..." : `${exchanges.length} swaps`}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : exchanges && exchanges.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {exchanges.map((exchange) => (
            <ExchangeCard key={exchange.id} exchange={exchange} currentUserId={currentUserId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Geen swaps gevonden.</p>
          <p className="text-gray-400 text-sm">Begin met het zoeken naar woningen om je eerste swap aan te vragen!</p>
          <div className="mt-6">
            <Link
              href="/listings"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Zoek woningen
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExchangesPage
