"use client"

import { Progress } from "@/components/ui/progress"
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

  // Check confirmation status
  const currentUserConfirmed = isRequester ? exchange.requester_confirmed : exchange.host_confirmed
  const otherUserConfirmed = isRequester ? exchange.host_confirmed : exchange.requester_confirmed

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="mb-4">
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
        {/* Stap 1: Details */}
        <div
          className={`flex flex-col items-center ${exchange.status === "accepted" || exchange.status === "confirmed" ? "text-teal-600" : "text-gray-400"}`}
        >
          <div
            className={`h-8 w-8 rounded-full ${exchange.status === "accepted" || exchange.status === "confirmed" ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {exchange.status === "accepted" || exchange.status === "confirmed" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
          </div>
          <span className="font-medium">Details</span>
        </div>

        {/* Stap 2: Goedkeuren */}
        <div
          className={`flex flex-col items-center ${exchange.requester_confirmed || exchange.host_confirmed ? "text-teal-600" : "text-gray-400"}`}
        >
          <div
            className={`h-8 w-8 rounded-full ${exchange.requester_confirmed || exchange.host_confirmed ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {exchange.requester_confirmed || exchange.host_confirmed ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
          </div>
          <span className="font-medium">Goedkeuren</span>
        </div>

        {/* Stap 3: Bevestigen */}
        <div
          className={`flex flex-col items-center ${exchange.status === "confirmed" ? "text-teal-600" : "text-gray-400"}`}
        >
          <div
            className={`h-8 w-8 rounded-full ${exchange.status === "confirmed" ? "bg-teal-100" : "bg-gray-100"} flex items-center justify-center mb-2`}
          >
            {exchange.status === "confirmed" ? <CheckCircle className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </div>
          <span className="font-medium">Bevestigen</span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {exchange.status === "pending" && "Wachten op acceptatie..."}
        {exchange.status === "accepted" &&
          !currentUserConfirmed &&
          !otherUserConfirmed &&
          "Beide partijen moeten goedkeuren"}
        {exchange.status === "accepted" && currentUserConfirmed && !otherUserConfirmed && "Wachten op andere partij..."}
        {exchange.status === "accepted" && !currentUserConfirmed && otherUserConfirmed && "Jouw goedkeuring nodig"}
        {exchange.status === "confirmed" && "🎉 Swap bevestigd!"}
      </div>
    </div>
  )
}
