"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Video, ExternalLink, Phone, Copy, Users, Monitor } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface VideocallSchedulerProps {
  exchange: any
  onStatusUpdate: () => void
}

export function VideocallScheduler({ exchange, onStatusUpdate }: VideocallSchedulerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmbeddedCall, setShowEmbeddedCall] = useState(false)
  const { toast } = useToast()

  const handleInstantCall = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/videocall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "instant",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start videocall")
      }

      toast({
        title: "📹 Videocall gestart!",
        description: "De andere persoon ontvangt een uitnodiging. Je kunt nu deelnemen!",
      })

      onStatusUpdate()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de videocall niet starten.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinCall = () => {
    if (exchange.videocall_link) {
      setShowEmbeddedCall(true)
    }
  }

  const handleJoinInNewTab = () => {
    if (exchange.videocall_link) {
      window.open(exchange.videocall_link, "_blank")
    }
  }

  const handleCompleteCall = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/videocall/complete`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to complete videocall")
      }

      toast({
        title: "✅ Videocall voltooid!",
        description: "Jullie kunnen nu beide de swap bevestigen.",
      })

      setShowEmbeddedCall(false)
      onStatusUpdate()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de videocall niet voltooien.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Link gekopieerd",
        description: "De videocall link is gekopieerd naar je klembord.",
      })
    } catch (error) {
      toast({
        title: "Kon link niet kopiëren",
        description: "Probeer de link handmatig te selecteren en kopiëren.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            Kennismaking via Daily.co
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-blue-800 text-sm">
              <strong>💡 Waarom een videocall?</strong> Maak kennis met elkaar voordat jullie de swap bevestigen.
            </p>
          </div>

          {/* Actieve videocall weergave */}
          {exchange.videocall_link && (
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-green-800 text-sm mb-3">
                <strong>📹 Videocall actief!</strong>
              </p>
              <div className="flex gap-2 mb-3">
                <Button onClick={handleJoinCall} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Monitor className="mr-2 h-4 w-4" />
                  Deelnemen
                </Button>
                <Button onClick={handleJoinInNewTab} variant="outline" className="flex-1">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Nieuwe Tab
                </Button>
                <Button onClick={() => copyLink(exchange.videocall_link!)} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleCompleteCall}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Users className="mr-2 h-4 w-4" />
                {isLoading ? "Voltooien..." : "Videocall Voltooid"}
              </Button>
            </div>
          )}

          {/* Start videocall knop */}
          {!exchange.videocall_link && (
            <Button onClick={handleInstantCall} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
              <Phone className="mr-2 h-4 w-4" />
              {isLoading ? "Starten..." : "Start Videocall"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Embedded Daily.co Modal */}
      <Dialog open={showEmbeddedCall} onOpenChange={setShowEmbeddedCall}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              Videocall - SwapBnB Kennismaking
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full">
            {exchange.videocall_link && (
              <iframe
                src={exchange.videocall_link}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="camera; microphone; fullscreen; speaker; display-capture"
                className="rounded-lg"
              />
            )}
            <div className="mt-4 flex justify-center">
              <Button onClick={handleCompleteCall} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                <Users className="mr-2 h-4 w-4" />
                {isLoading ? "Voltooien..." : "Videocall Voltooid"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
