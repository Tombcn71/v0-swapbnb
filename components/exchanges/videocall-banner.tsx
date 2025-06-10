"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Video, ExternalLink, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideocallBannerProps {
  exchangeId: string
}

export function VideocallBanner({ exchangeId }: VideocallBannerProps) {
  const [videocallData, setVideocallData] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check for active videocall
    const checkVideocall = async () => {
      try {
        const response = await fetch(`/api/exchanges/${exchangeId}/messages`)
        if (response.ok) {
          const messages = await response.json()

          // Find the latest videocall message
          const videocallMessage = messages
            .filter((msg: any) => msg.content.includes('"type":"videocall_invite"'))
            .pop()

          if (videocallMessage) {
            try {
              const data = JSON.parse(videocallMessage.content)
              setVideocallData(data)
            } catch (e) {
              console.error("Error parsing videocall data:", e)
            }
          }
        }
      } catch (error) {
        console.error("Error checking videocall:", error)
      }
    }

    checkVideocall()
    // Check every 10 seconds for new videocalls
    const interval = setInterval(checkVideocall, 10000)
    return () => clearInterval(interval)
  }, [exchangeId])

  if (!videocallData || !isVisible) {
    return null
  }

  const handleJoinCall = () => {
    window.open(videocallData.link, "_blank", "noopener,noreferrer")
    toast({
      title: "Videocall geopend",
      description: "De videocall is geopend in een nieuwe tab.",
    })
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Video className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">{videocallData.text}</h3>
              <p className="text-sm text-green-700">Klik om deel te nemen aan de videocall</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleJoinCall} className="bg-green-600 hover:bg-green-700 text-white">
              <Video className="h-4 w-4 mr-2" />
              Deelnemen
            </Button>

            <Button
              onClick={handleJoinCall}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Nieuwe tab
            </Button>

            <Button onClick={handleDismiss} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
