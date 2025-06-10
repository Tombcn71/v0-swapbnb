"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Send, AlertCircle, Trash2, MoreVertical, Video, Phone, Copy } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  sender_name: string
  receiver_name: string
  message_type?: string
}

interface MessageListProps {
  recipientId: string
  recipientName: string
}

export function MessageList({ recipientId, recipientName }: MessageListProps) {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const fetchMessages = async () => {
    if (status !== "authenticated") return

    try {
      setError(null)
      console.log("Fetching messages with recipient:", recipientId)
      const response = await fetch(`/api/messages?userId=${recipientId}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.error || "Failed to fetch messages")
      }

      const data = await response.json()
      console.log("Fetched messages:", data)

      // Controleer of er nieuwe berichten zijn
      const newMessages = data.filter(
        (newMsg: Message) =>
          !messages.some((existingMsg) => existingMsg.id === newMsg.id) && newMsg.sender_id === recipientId,
      )

      if (newMessages.length > 0 && messages.length > 0) {
        // Toon notificatie voor nieuwe berichten
        toast({
          title: "Nieuw bericht",
          description: `Je hebt ${newMessages.length} nieuwe ${newMessages.length === 1 ? "bericht" : "berichten"} ontvangen van ${recipientName}`,
        })

        // Speel een geluid af (optioneel)
        const audio = new Audio("/notification-sound.mp3")
        audio.play().catch((e) => console.log("Audio play failed:", e))
      }

      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError("Er is een fout opgetreden bij het ophalen van berichten. Probeer het later opnieuw.")
      toast({
        title: "Fout bij het laden van berichten",
        description: "Er is een fout opgetreden bij het ophalen van berichten. Probeer het later opnieuw.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (status === "authenticated" && recipientId) {
      fetchMessages()
      // Set up polling for new messages
      const interval = setInterval(fetchMessages, 10000)
      return () => clearInterval(interval)
    }
  }, [status, recipientId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: recipientId,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }

      setNewMessage("")
      fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Fout bij het verzenden van bericht",
        description: "Er is een fout opgetreden bij het verzenden van je bericht. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete message")
      }

      // Verwijder het bericht uit de lokale state
      setMessages(messages.filter((msg) => msg.id !== messageId))

      toast({
        title: "Bericht verwijderd",
        description: "Het bericht is succesvol verwijderd.",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Fout bij het verwijderen van bericht",
        description: "Er is een fout opgetreden bij het verwijderen van het bericht. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setMessageToDelete(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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

  const renderMessageContent = (message: Message) => {
    const isVideocallMessage =
      message.message_type === "videocall_scheduled" || message.message_type === "videocall_invite"

    if (isVideocallMessage) {
      try {
        // Parse the JSON content
        const messageData = JSON.parse(message.content)
        const { text, link, linkText, scheduledAt } = messageData

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              {message.message_type === "videocall_scheduled" ? (
                <Video className="h-4 w-4 text-blue-600" />
              ) : (
                <Phone className="h-4 w-4 text-green-600" />
              )}
              <span className="text-sm font-medium text-blue-800">
                {message.message_type === "videocall_scheduled" ? "Geplande Videocall" : "Videocall Uitnodiging"}
              </span>
            </div>

            <p className="text-sm">{text}</p>

            {scheduledAt && (
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                📅{" "}
                {new Date(scheduledAt).toLocaleString("nl-NL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                onClick={() => window.open(link, "_blank")}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Video className="h-4 w-4 mr-1" />
                Deelnemen
              </Button>
              <Button onClick={() => copyLink(link)} variant="outline" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      } catch (e) {
        console.error("Error parsing videocall message:", e)
        // Fallback - toon de raw content als er een parsing error is
        return (
          <div>
            <p className="text-sm text-red-600">Fout bij het laden van videocall bericht</p>
            <p className="text-xs text-gray-500 mt-1">{message.content}</p>
          </div>
        )
      }
    }

    // Normale berichten - zoek naar URLs en maak ze klikbaar
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = message.content.split(urlRegex)

    return (
      <div>
        {parts.map((part, index) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                {part}
              </a>
            )
          }
          return <span key={index}>{part}</span>
        })}
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-t-teal-500 border-r-transparent border-b-teal-500 border-l-transparent rounded-full mx-auto mb-4"></div>
          <p>Berichten laden...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p>Je moet ingelogd zijn om berichten te bekijken.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{recipientName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!error && messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            Nog geen berichten. Stuur een bericht om de conversatie te starten.
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === session?.user?.id
            const isVideocallMessage =
              message.message_type === "videocall_scheduled" || message.message_type === "videocall_invite"

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
                >
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=32&width=32&query=${message.sender_name}`}
                      />
                      <AvatarFallback>{message.sender_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="relative group">
                    <Card
                      className={`${
                        isVideocallMessage
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                          : isCurrentUser
                            ? "bg-teal-500 text-white"
                            : "bg-gray-100"
                      }`}
                    >
                      <CardContent className="p-3">{renderMessageContent(message)}</CardContent>
                    </Card>
                    <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? "text-right" : ""}`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: nl })}
                    </p>

                    {isCurrentUser && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Acties</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setMessageToDelete(message.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Verwijderen</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Typ een bericht..."
            className="resize-none"
            rows={2}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !newMessage.trim()} className="self-end">
            <Send className="h-5 w-5" />
            <span className="sr-only">Verstuur</span>
          </Button>
        </div>
      </div>

      {/* Bevestigingsdialoog voor het verwijderen van een bericht */}
      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bericht verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je dit bericht wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={() => messageToDelete && handleDeleteMessage(messageToDelete)}>
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
