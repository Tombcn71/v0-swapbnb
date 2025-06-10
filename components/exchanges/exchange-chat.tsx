"use client"

import { Send, Video } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useVideocall } from "@/components/providers/videocall-provider"

interface ExchangeChatProps {
  exchange: any // Replace with actual type
  messages: any[] // Replace with actual type
  currentUserId: string
  isRequester: boolean
  isHost: boolean
  onMessageSent: (message: string) => void
  onStatusUpdate: (status: string) => void
  isLoading: boolean
}

export function ExchangeChat({
  exchange,
  messages,
  currentUserId,
  isRequester,
  isHost,
  onMessageSent,
  onStatusUpdate,
  isLoading,
}: ExchangeChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { startVideocall } = useVideocall()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      await onMessageSent(newMessage)
      setNewMessage("")
    } finally {
      setIsSending(false)
    }
  }

  const handleStartVideocall = async () => {
    try {
      await startVideocall(exchange.id)
      toast({
        title: "Videocall gestart",
        description: "De andere persoon ontvangt een uitnodiging.",
      })
    } catch (error) {
      console.error("Error starting videocall:", error)
      toast({
        title: "Fout bij starten videocall",
        description: "Er is een fout opgetreden bij het starten van de videocall.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message: any) => (
          <div
            key={message.id}
            className={cn(
              "mb-2 p-2 rounded-lg",
              message.senderId === currentUserId ? "bg-blue-100 ml-auto w-fit" : "bg-gray-100 mr-auto w-fit",
            )}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-end gap-2 mt-2 p-4 border-t">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Typ een bericht..."
          className="min-h-[80px] flex-1"
        />
        <div className="flex flex-col gap-2">
          <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>

          {(exchange.status === "accepted" || exchange.status === "videocall_scheduled") && (
            <Button
              onClick={handleStartVideocall}
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              title="Start videocall"
            >
              <Video className="h-4 w-4 text-blue-600" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
