"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Video, X, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideocallBannerProps {
  exchangeId: string
  onStatusUpdate?: () => void
}

export function VideocallBanner({ exchangeId, onStatusUpdate }: VideocallBannerProps) {
  const [videocallData, setVideocallData] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)
  const { toast } = useToast()
  const [isCallActive, setIsCallActive] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

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

  const handleJoinCall = () => {
    setIsCallActive(true)
    toast({
      title: "Videocall gestart",
      description: "Je bent nu verbonden met de videocall.",
    })
  }

  const handleEndCall = () => {
    setIsCallActive(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  const handleCompleteCall = async () => {
    setIsCompleting(true)
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/videocall/complete`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "✅ Videocall voltooid!",
          description: "Je kunt nu doorgaan naar de bevestigingsstap.",
        })
        setIsVisible(false)
        if (onStatusUpdate) {
          onStatusUpdate()
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to complete videocall")
      }
    } catch (error: any) {
      console.error("Error completing videocall:", error)
      toast({
        title: "❌ Fout",
        description: error.message || "Er is een fout opgetreden bij het voltooien van de videocall.",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }

  if (!videocallData || !isVisible) {
    return null
  }

  // Als videocall actief is, toon iframe
  if (isCallActive) {
    return (
      <Card className="bg-black">
        <CardContent className="p-0">
          <div className="bg-gray-900 p-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Video className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Videocall actief</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCompleteCall}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Videocall voltooid
              </Button>
              <Button onClick={handleEndCall} size="sm" variant="ghost" className="text-white hover:bg-gray-700">
                <X className="h-4 w-4 mr-1" />
                Sluiten
              </Button>
            </div>
          </div>
          <div className="h-96 w-full">
            <iframe
              src={videocallData.link}
              allow="camera; microphone; fullscreen; speaker; display-capture"
              className="w-full h-full border-0"
              title="Videocall"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Anders toon de banner (rest blijft hetzelfde)
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

            <Button onClick={handleDismiss} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
