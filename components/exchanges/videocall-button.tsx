"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Video } from "lucide-react"

interface VideocallButtonProps {
  exchangeId: string
  recipientId: string
}

export function VideocallButton({ exchangeId, recipientId }: VideocallButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [roomUrl, setRoomUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const startVideocall = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/videocall`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create videocall")
      }

      const data = await response.json()
      setRoomUrl(data.url)
      setIsOpen(true)
    } catch (error) {
      console.error("Error starting videocall:", error)
      alert("Er is een fout opgetreden bij het starten van de videocall. Probeer het later opnieuw.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={startVideocall}
        disabled={isLoading}
        className="flex items-center gap-1"
      >
        <Video className="h-4 w-4" />
        {isLoading ? "Laden..." : "Videocall"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0">
          <div className="relative w-full h-[80vh]">
            <iframe
              src={roomUrl}
              allow="camera; microphone; fullscreen; speaker; display-capture"
              className="w-full h-full border-0"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button variant="destructive" onClick={() => setIsOpen(false)}>
                Sluiten
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
