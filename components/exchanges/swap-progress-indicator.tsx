"use client"

import { Heart, CheckCircle, Clock, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Exchange } from "@/lib/types"

interface SwapProgressIndicatorProps {
  exchange: Exchange
  currentUserId: string
  isRequester: boolean
  isHost: boolean
}

export function SwapProgressIndicator({ exchange, currentUserId, isRequester, isHost }: SwapProgressIndicatorProps) {
  // Determine current user and other user confirmation status
  const currentUserConfirmed = isRequester ? exchange.requester_confirmed : exchange.host_confirmed
  const otherUserConfirmed = isRequester ? exchange.host_confirmed : exchange.requester_confirmed
  const bothConfirmed = currentUserConfirmed && otherUserConfirmed

  // Calculate progress percentage
  const getProgress = () => {
    if (exchange.status === "pending") return 25
    if (exchange.status === "accepted" && !currentUserConfirmed && !otherUserConfirmed) return 50
    if (exchange.status === "accepted" && (currentUserConfirmed || otherUserConfirmed)) return 75
    if (exchange.status === "confirmed" || bothConfirmed) return 100
    return 0
  }

  const progress = getProgress()

  // Get current step info
  const getCurrentStep = () => {
    if (exchange.status === "pending") {
      return {
        title: "Wachten op acceptatie",
        description: isHost ? "Accepteer of wijs de swap af" : "Wachten op reactie van de host",
        icon: <Clock className="h-5 w-5 text-orange-500" />,
        color: "orange",
      }
    }

    if (exchange.status === "accepted") {
      if (!currentUserConfirmed && !otherUserConfirmed) {
        return {
          title: "Bevestiging vereist",
          description: "Beide partijen moeten de swap bevestigen",
          icon: <Heart className="h-5 w-5 text-pink-500" />,
          color: "pink",
        }
      }

      if (currentUserConfirmed && !otherUserConfirmed) {
        return {
          title: "Jij hebt bevestigd! ✓",
          description: "Wachten op bevestiging van de andere partij",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: "green",
        }
      }

      if (!currentUserConfirmed && otherUserConfirmed) {
        return {
          title: "Andere partij heeft bevestigd",
          description: "Jouw bevestiging is nog vereist",
          icon: <Heart className="h-5 w-5 text-pink-500" />,
          color: "pink",
        }
      }
    }

    if (exchange.status === "confirmed" || bothConfirmed) {
      return {
        title: "Swap bevestigd! 🎉",
        description: "Jullie swap is definitief - geniet ervan!",
        icon: <Sparkles className="h-5 w-5 text-purple-500" />,
        color: "purple",
      }
    }

    return {
      title: "Status onbekend",
      description: "",
      icon: <Clock className="h-5 w-5 text-gray-500" />,
      color: "gray",
    }
  }

  const currentStep = getCurrentStep()

  const getProgressColor = () => {
    if (progress === 100) return "bg-gradient-to-r from-green-500 to-purple-500"
    if (progress >= 75) return "bg-gradient-to-r from-blue-500 to-green-500"
    if (progress >= 50) return "bg-gradient-to-r from-orange-500 to-blue-500"
    return "bg-gradient-to-r from-gray-400 to-orange-500"
  }

  return (
    <Card className="mb-4 border-2 border-dashed border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with icon and title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStep.icon}
              <div>
                <h3 className="font-semibold text-lg">{currentStep.title}</h3>
                <p className="text-sm text-gray-600">{currentStep.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {progress}% voltooid
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Voortgang</span>
              <span>{progress}/100</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div
                className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Status indicators for both users */}
          {exchange.status === "accepted" && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${currentUserConfirmed ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Jij: {currentUserConfirmed ? "✓ Bevestigd" : "⏳ Te bevestigen"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${otherUserConfirmed ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">
                  Andere partij: {otherUserConfirmed ? "✓ Bevestigd" : "⏳ Te bevestigen"}
                </span>
              </div>
            </div>
          )}

          {/* Special message for first swap */}
          {exchange.status === "accepted" && !bothConfirmed && (
            <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="text-sm text-pink-700 font-medium">
                💝 Eerste swap is gratis voor nieuwe gebruikers!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
