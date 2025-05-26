"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, Home } from "lucide-react"
import Image from "next/image"
import type { Exchange } from "@/lib/types"

interface ExchangeSidebarProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangeSidebar({ exchange, isRequester }: ExchangeSidebarProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusColor = () => {
    switch (exchange.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "videocall_completed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="w-80 bg-white border-l h-full overflow-y-auto">
      {/* House Preview */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5" />
            {isRequester ? "Jouw bestemming" : "Hun huis"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* House Image */}
          <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
            <Image
              src={targetHome.images?.[0] || "/placeholder.svg?height=200&width=300&query=house"}
              alt={targetHome.title}
              width={300}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>

          {/* House Details */}
          <div>
            <h3 className="font-semibold text-lg">{targetHome.title}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {targetHome.city}
            </div>
            <p className="text-sm text-gray-600 mt-1">Eigenaar: {targetHome.owner}</p>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Swap Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-gray-600 text-sm mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                Aankomst
              </div>
              <p className="font-semibold">{formatDate(exchange.start_date)}</p>
            </div>
            <div>
              <div className="flex items-center text-gray-600 text-sm mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                Vertrek
              </div>
              <p className="font-semibold">{formatDate(exchange.end_date)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center text-gray-600 text-sm mb-1">
              <Users className="h-4 w-4 mr-1" />
              Gasten
            </div>
            <p className="font-semibold">{exchange.guests} personen</p>
          </div>

          <div>
            <div className="text-gray-600 text-sm mb-1">Status</div>
            <Badge className={getStatusColor()}>
              {exchange.status === "pending" && "⏳ Wacht op antwoord"}
              {exchange.status === "accepted" && "✓ Geaccepteerd"}
              {exchange.status === "videocall_scheduled" && "📹 Videocall gepland"}
              {exchange.status === "videocall_completed" && "✓ Videocall voltooid"}
              {exchange.status === "completed" && "🎉 Voltooid"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Type */}
      <Card className="m-4">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Exchange Type</div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Wederzijds
            </Badge>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600 mb-1">Swap Fee</div>
            <div className="text-2xl font-bold text-orange-600">€20</div>
            <div className="text-xs text-gray-500">per persoon</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
