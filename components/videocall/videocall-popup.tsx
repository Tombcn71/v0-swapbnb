"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PhoneOff } from "lucide-react"

interface VideocallPopupProps {
  roomUrl: string | null
  exchangeId: string | null
  onClose: () => void
}

export function VideocallPopup({ roomUrl, exchangeId, onClose }: VideocallPopupProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (roomUrl) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [roomUrl])

  const handleEndCall = async () => {
    if (exchangeId) {
      try {
        await fetch(`/api/exchanges/${exchangeId}/videocall/complete`, {
          method: "POST",
        })
      } catch (error) {
        console.error("Error completing videocall:", error)
      }
    }
    setIsOpen(false)
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0">
        <DialogHeader className="p-4 flex flex-row justify-between items-center">
          <DialogTitle>Videocall</DialogTitle>
          <Button onClick={handleEndCall} variant="destructive" size="sm">
            <PhoneOff className="h-4 w-4 mr-2" />
            Beëindigen
          </Button>
        </DialogHeader>
        {roomUrl && (
          <div className="w-full h-[70vh]">
            <iframe
              src={roomUrl}
              allow="camera; microphone; fullscreen; speaker; display-capture"
              className="w-full h-full border-0"
            ></iframe>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
