"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Mic, PhoneOff, Maximize2, Minimize2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmbeddedVideocallProps {
  roomUrl: string
  onCallEnd?: () => void
  exchangeId: string
}

export function EmbeddedVideocall({ roomUrl, onCallEnd, exchangeId }: EmbeddedVideocallProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { toast } = useToast()

  const startCall = () => {
    setIsCallActive(true)
    toast({
      title: "Videocall gestart",
      description: "Je bent nu verbonden met de videocall.",
    })
  }

  const endCall = async () => {
    setIsCallActive(false)
    setIsFullscreen(false)

    // Markeer videocall als voltooid
    try {
      await fetch(`/api/exchanges/${exchangeId}/videocall/complete`, {
        method: "POST",
      })

      toast({
        title: "Videocall beëindigd",
        description: "De videocall is beëindigd. Je kunt nu de swap bevestigen.",
      })

      if (onCallEnd) {
        onCallEnd()
      }
    } catch (error) {
      console.error("Error completing videocall:", error)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!isCallActive) {
    return (
      <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Video className="h-5 w-5" />
            Videocall uitnodiging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">📞 Je bent uitgenodigd voor een videocall om kennis te maken!</p>
          <div className="flex gap-2">
            <Button onClick={startCall} className="bg-green-600 hover:bg-green-700 text-white">
              <Video className="h-4 w-4 mr-2" />
              Videocall starten
            </Button>
            <Button
              onClick={() => window.open(roomUrl, "_blank")}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Externe link
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full ${isFullscreen ? "fixed inset-4 z-50" : ""} bg-black`}>
      <CardHeader className="bg-gray-900 text-white p-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Video className="h-4 w-4 text-green-400" />
            Videocall actief
          </CardTitle>
          <div className="flex gap-1">
            <Button
              onClick={toggleFullscreen}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700 h-8 w-8 p-0"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button onClick={endCall} size="sm" variant="ghost" className="text-red-400 hover:bg-red-900 h-8 w-8 p-0">
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={`${isFullscreen ? "h-[calc(100vh-8rem)]" : "h-96"} w-full`}>
          <iframe
            src={roomUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            className="w-full h-full border-0"
            title="Daily.co Videocall"
          />
        </div>
        <div className="bg-gray-900 p-2 flex justify-center gap-2">
          <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700">
            <Mic className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700">
            <Video className="h-4 w-4" />
          </Button>
          <Button onClick={endCall} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
            <PhoneOff className="h-4 w-4 mr-1" />
            Beëindigen
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
