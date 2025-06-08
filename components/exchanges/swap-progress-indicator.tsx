"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Heart, AlertCircle } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface SwapProgressIndicatorProps {
  exchange: Exchange
  currentUserId: string
  isRequester: boolean
  isHost: boolean
}

export function SwapProgressIndicator({ exchange, currentUserId, isRequester, isHost }: SwapProgressIndicatorProps) {
  // Calculate progress based on status
  const getProgressPercentage = () => {
    switch (exchange.status) {
      case "pending":
        return 25
      case "accepted":
        if (exchange.requester_confirmed || exchange.host_confirmed) {
          return 75
        }
        return 50
      case "confirmed":
        return 100
      case "rejected":
      case "cancelled":
        return 0
      default:
        return 0
    }
  }

  // Check confirmation status
  const currentUserConfirmed = isRequester ? exchange.requester_confirmed : exchange.host_confirmed
  const otherUserConfirmed = isRequester ? exchange.host_confirmed : exchange.requester_confirmed

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-700">Swap Voortgang</h3>
      </div>

      <div className="mb-4">
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div
          className={`flex flex-col items-center ${exchange.status !== "rejected" && exchange.status !== "cancelled" ? "text-blue-600" : "text-gray-400"}`}
        >
          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mb-1">
            <Clock className="h-3 w-3" />
          </div>
          <span>Aangevraagd</span>
        </div>

        <div
          className={`flex flex-col items-center ${exchange.status === "accepted" || exchange.status === "confirmed" ? "text-blue-600" : "text-gray-400"}`}
        >
          <div
            className={`h-6 w-6 rounded-full ${exchange.status === "accepted" || exchange.status === "confirmed" ? "bg-blue-100" : "bg-gray-100"} flex items-center justify-center mb-1`}
          >
            <CheckCircle className="h-3 w-3" />
          </div>
          <span>Geaccepteerd</span>
        </div>

        <div
          className={`flex flex-col items-center ${exchange.requester_confirmed || exchange.host_confirmed ? "text-blue-600" : "text-gray-400"}`}
        >
          <div
            className={`h-6 w-6 rounded-full ${exchange.requester_confirmed || exchange.host_confirmed ? "bg-pink-100" : "bg-gray-100"} flex items-center justify-center mb-1`}
          >
            <Heart
              className={`h-3 w-3 ${exchange.requester_confirmed || exchange.host_confirmed ? "text-pink-500" : ""}`}
            />
          </div>
          <span>Bevestigd</span>
        </div>

        <div
          className={`flex flex-col items-center ${exchange.status === "confirmed" ? "text-green-600" : "text-gray-400"}`}
        >
          <div
            className={`h-6 w-6 rounded-full ${exchange.status === "confirmed" ? "bg-green-100" : "bg-gray-100"} flex items-center justify-center mb-1`}
          >
            <CheckCircle className="h-3 w-3" />
          </div>
          <span>Voltooid</span>
        </div>
      </div>

      {/* Status details */}
      <div className="mt-4 text-xs">
        {exchange.status === "pending" && (
          <div className="flex items-center text-amber-600 gap-1">
            <Clock className="h-3 w-3" />
            <span>Wachten op acceptatie door de eigenaar</span>
          </div>
        )}

        {exchange.status === "accepted" && !currentUserConfirmed && !otherUserConfirmed && (
          <div className="flex items-center text-blue-600 gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Beide partijen moeten de swap bevestigen</span>
          </div>
        )}

        {exchange.status === "accepted" && currentUserConfirmed && !otherUserConfirmed && (
          <div className="flex items-center text-blue-600 gap-1">
            <Clock className="h-3 w-3" />
            <span>Wachten op bevestiging van de andere partij</span>
          </div>
        )}

        {exchange.status === "accepted" && !currentUserConfirmed && otherUserConfirmed && (
          <div className="flex items-center text-amber-600 gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>De andere partij heeft bevestigd, jouw bevestiging is nodig</span>
          </div>
        )}

        {exchange.status === "confirmed" && (
          <div className="flex items-center text-green-600 gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Swap succesvol bevestigd door beide partijen!</span>
          </div>
        )}

        {(exchange.status === "rejected" || exchange.status === "cancelled") && (
          <div className="flex items-center text-red-600 gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Deze swap is {exchange.status === "rejected" ? "afgewezen" : "geannuleerd"}</span>
          </div>
        )}
      </div>
    </div>
  )
}
