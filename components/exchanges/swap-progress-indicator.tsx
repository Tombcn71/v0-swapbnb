"use client"
import { CheckCircle, MessageCircle, UserCheck } from "lucide-react"
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
    if (exchange.status === "accepted") return 33
    if (exchange.requester_confirmed || exchange.host_confirmed) return 66
    if (exchange.status === "confirmed") return 100
    return 0
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
        {/* Stap 1: Details */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${exchange.status === "accepted" || exchange.status === "confirmed" ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {exchange.status === "accepted" || exchange.status === "confirmed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : (
              <MessageCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span
            className={`font-medium ${exchange.status === "accepted" || exchange.status === "confirmed" ? "text-teal-600" : "text-gray-400"}`}
          >
            Details
          </span>
        </div>

        {/* Stap 2: Goedkeuren */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${exchange.requester_confirmed || exchange.host_confirmed ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {exchange.requester_confirmed || exchange.host_confirmed ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : (
              <UserCheck className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span
            className={`font-medium ${exchange.requester_confirmed || exchange.host_confirmed ? "text-teal-600" : "text-gray-400"}`}
          >
            Goedkeuren
          </span>
        </div>

        {/* Stap 3: Bevestigen */}
        <div className="flex flex-col items-center">
          <div
            className={`h-8 w-8 rounded-full ${exchange.status === "confirmed" ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {exchange.status === "confirmed" ? (
              <CheckCircle className="h-4 w-4 text-teal-600" />
            ) : (
              <UserCheck className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span className={`font-medium ${exchange.status === "confirmed" ? "text-teal-600" : "text-gray-400"}`}>
            Bevestigen
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {exchange.status === "pending" && "Wachten op acceptatie..."}
        {exchange.status === "accepted" &&
          !exchange.requester_confirmed &&
          !exchange.host_confirmed &&
          "Beide partijen moeten goedkeuren"}
        {exchange.status === "accepted" &&
          (exchange.requester_confirmed || exchange.host_confirmed) &&
          !(exchange.requester_confirmed && exchange.host_confirmed) &&
          "Wachten op andere partij..."}
        {exchange.status === "confirmed" && "🎉 Swap bevestigd!"}
      </div>
    </div>
  )
}
