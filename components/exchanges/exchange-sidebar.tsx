"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Bed, MapPin } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangeSidebarProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangeSidebar({ exchange, isRequester }: ExchangeSidebarProps) {
  // Bepaal welk huis we tonen (het andere huis dan dat van de gebruiker)
  const targetHome = isRequester
    ? {
        title: exchange.host_home_title,
        city: exchange.host_home_city,
        images: exchange.host_home_images,
        owner: exchange.host_name,
      }
    : {
        title: exchange.requester_home_title,
        city: exchange.requester_home_city,
        images: exchange.requester_home_images,
        owner: exchange.requester_name,
      }

  // Bereken aantal nachten
  const startDate = new Date(exchange.start_date)
  const endDate = new Date(exchange.end_date)
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "videocall_scheduled":
        return "bg-purple-100 text-purple-800"
      case "videocall_completed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Parse images
  let images: string[] = []
  if (typeof targetHome.images === "string") {
    try {
      images = JSON.parse(targetHome.images)
    } catch {
      images = [targetHome.images]
    }
  } else if (Array.isArray(targetHome.images)) {
    images = targetHome.images
  }

  return (
    <div className="w-80 border-l bg-gray-50 p-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{targetHome.title}</CardTitle>
            <Badge className={getStatusColor(exchange.status)}>{exchange.status}</Badge>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {targetHome.city}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Huis Foto */}
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={images[0] || "/placeholder.svg?height=200&width=300&query=house"}
              alt={targetHome.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Swap Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>Aankomst</span>
              </div>
              <span className="text-sm font-medium">{new Date(exchange.start_date).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>Vertrek</span>
              </div>
              <span className="text-sm font-medium">{new Date(exchange.end_date).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <span>Gasten</span>
              </div>
              <span className="text-sm font-medium">{exchange.guests}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Bed className="w-4 h-4 mr-2 text-gray-500" />
                <span>Nachten</span>
              </div>
              <span className="text-sm font-medium">{nights}</span>
            </div>
          </div>

          {/* Swap Fee */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Swap fee</span>
              <span className="text-lg font-bold text-orange-600">€20</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Eenmalige kosten per persoon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
