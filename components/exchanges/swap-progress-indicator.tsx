import { CheckCircle, Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Exchange } from "@/lib/types"

interface SwapProgressIndicatorProps {
  exchange: Exchange
  currentUserId: string
  isRequester: boolean
  isHost: boolean
}

export function SwapProgressIndicator({ exchange, currentUserId, isRequester, isHost }: SwapProgressIndicatorProps) {
  // Determine the current stage
  const getStage = () => {
    if (exchange.status === "pending") return 0
    if (exchange.status === "accepted") return 1
    if (exchange.status === "confirmed") return 2
    return 0
  }

  const currentStage = getStage()
  const progressPercentage = (currentStage / 2) * 100

  // Check if the current user has confirmed
  const userConfirmed = isRequester ? exchange.requester_confirmed : exchange.host_confirmed
  const otherUserConfirmed = isRequester ? exchange.host_confirmed : exchange.requester_confirmed

  return (
    <div className="mb-6">
      <div className="relative mb-2">
        <Progress value={progressPercentage} className="h-2 bg-gray-200" />
      </div>
      <div className="flex justify-between text-sm">
        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
              currentStage >= 0 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {currentStage > 0 ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </div>
          <span className={currentStage >= 0 ? "text-teal-700 font-medium" : "text-gray-500"}>Details</span>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
              currentStage >= 1 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {currentStage > 1 ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </div>
          <span className={currentStage >= 1 ? "text-teal-700 font-medium" : "text-gray-500"}>
            {isHost ? "Goedkeuren" : "Host Goedkeuring"}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
              currentStage >= 2 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {currentStage > 2 ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </div>
          <span className={currentStage >= 2 ? "text-teal-700 font-medium" : "text-gray-500"}>Bevestigen</span>
        </div>
      </div>
    </div>
  )
}
