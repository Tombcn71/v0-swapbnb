"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Video, ExternalLink, Monitor, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideocallMessageProps {
  message: any
  isOwn: boolean
}

export function VideocallMessage({ message, isOwn }: VideocallMessageProps) {
  const [showEmbeddedCall, setShowEmbeddedCall] = useState(false)
  const { toast } = useToast()

  const messageContent = typeof message.content === "string" ? JSON.parse(message.content) : message.content

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(messageContent.link)
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

  const handleJoinEmbedded = () => {
    setShowEmbeddedCall(true)
  }

  const handleJoinNewTab = () => {
    window.open(messageContent.link, "_blank")
  }

  return (
    <>
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={`max-w-sm px-4 py-3 rounded-lg ${
            isOwn ? "bg-blue-500 text-white" : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Video className={`h-4 w-4 ${isOwn ? "text-white" : "text-blue-600"}`} />
            <span className={`font-medium text-sm ${isOwn ? "text-white" : "text-blue-800"}`}>
              {message.message_type === "videocall_scheduled" ? "Geplande Videocall" : "Videocall Uitnodiging"}
            </span>
          </div>

          <p className={`text-sm mb-3 ${isOwn ? "text-white" : "text-gray-700"}`}>{messageContent.text}</p>

          {messageContent.scheduledAt && (
            <p className={`text-xs mb-3 ${isOwn ? "text-blue-100" : "text-blue-600"}`}>
              📅{" "}
              {new Date(messageContent.scheduledAt).toLocaleString("nl-NL", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleJoinEmbedded}
              className={isOwn ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 hover:bg-blue-700"}
            >
              <Monitor className="mr-1 h-3 w-3" />
              Deelnemen
            </Button>
            <Button size="sm" variant={isOwn ? "secondary" : "outline"} onClick={handleJoinNewTab}>
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button size="sm" variant={isOwn ? "secondary" : "outline"} onClick={copyLink}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          <p className={`text-xs mt-2 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
            {new Date(message.created_at).toLocaleTimeString("nl-NL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Embedded Daily.co Modal */}
      <Dialog open={showEmbeddedCall} onOpenChange={setShowEmbeddedCall}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              SwapBnB Videocall
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full">
            <iframe
              src={messageContent.link}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="camera; microphone; fullscreen; speaker; display-capture"
              className="rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
