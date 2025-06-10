"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Calendar, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Exchange } from "@/lib/types"

interface VideocallSchedulerProps {
  exchange: Exchange
  onStatusUpdate: () => void
}

export function VideocallScheduler({ exchange, onStatusUpdate }: VideocallSchedulerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleScheduleVideocall = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/videocall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "schedule" }),
      })

      if (response.ok) {
        toast({
          title: "📹 Videocall gepland!",
          description: "Jullie kunnen nu een videocall starten om kennis te maken.",
        })
        onStatusUpdate()
      }
    } catch (error) {
      console.error("Error scheduling videocall:", error)
      toast({
        title: "❌ Fout",
        description: "Er is een fout opgetreden bij het plannen van de videocall.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteVideocall = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/videocall/complete`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "✅ Kennismaking voltooid!",
          description: "Jullie kunnen nu de swap bevestigen.",
        })
        onStatusUpdate()
      }
    } catch (error) {
      console.error("Error completing videocall:", error)
      toast({
        title: "❌ Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipVideocall = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/skip-videocall`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "⏭️ Videocall overgeslagen",
          description: "Jullie kunnen direct de swap bevestigen.",
        })
        onStatusUpdate()
      }
    } catch (error) {
      console.error("Error skipping videocall:", error)
      toast({
        title: "❌ Fout",
        description: "Er is een fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show if already completed
  if (exchange.status === "videocall_completed") {
    return null
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Videocall
        </CardTitle>
      </CardHeader>
      <CardContent>
        {exchange.status === "accepted" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Plan een videocall om kennis te maken voordat jullie de swap bevestigen.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleScheduleVideocall} disabled={isLoading} className="flex-1">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                Plan Videocall
              </Button>
              <Button onClick={handleSkipVideocall} variant="outline" disabled={isLoading}>
                Overslaan
              </Button>
            </div>
          </div>
        )}

        {exchange.status === "videocall_scheduled" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Videocall is gepland! Start de call om kennis te maken.</p>
            <Button onClick={handleCompleteVideocall} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Videocall Voltooid
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
