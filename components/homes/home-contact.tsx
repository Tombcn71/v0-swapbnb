"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Send, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Home } from "@/lib/types"

interface HomeContactProps {
  home: Home
  userId?: string
  hostImage?: string
  isOwner?: boolean
}

export function HomeContact({ home, userId, hostImage, isOwner }: HomeContactProps) {
  const [message, setMessage] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChatted, setHasChatted] = useState(false)
  const [isCheckingChat, setIsCheckingChat] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Controleer of er al een chatinteractie is geweest
  useEffect(() => {
    const checkChatHistory = async () => {
      if (!userId) {
        setIsCheckingChat(false)
        return
      }

      setIsCheckingChat(true)
      try {
        const response = await fetch(`/api/messages/check-history?recipientId=${home.user_id || home.userId}`)
        if (response.ok) {
          const data = await response.json()
          setHasChatted(data.hasHistory)
        }
      } catch (error) {
        console.error("Error checking chat history:", error)
      } finally {
        setIsCheckingChat(false)
      }
    }

    checkChatHistory()
  }, [userId, home.user_id, home.userId])

  // Log voor debugging
  useEffect(() => {
    console.log("HomeContact - hostImage:", hostImage)
    console.log("HomeContact - hasChatted:", hasChatted)
    console.log("HomeContact - userId:", userId)
    console.log("HomeContact - isOwner:", isOwner)
    console.log("HomeContact - home:", home)
  }, [hostImage, hasChatted, userId, isOwner, home])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      toast({
        title: "Je bent niet ingelogd",
        description: "Log in om een bericht te sturen",
        variant: "destructive",
      })
      return
    }

    if (!message) {
      toast({
        title: "Bericht is leeg",
        description: "Voer een bericht in",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: home.user_id || home.userId,
          content: message,
          homeId: home.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast({
        title: "Bericht verzonden",
        description: "Je bericht is succesvol verzonden",
      })

      setMessage("")
      setHasChatted(true) // Update de status na het verzenden van een bericht
      router.refresh()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Fout bij verzenden",
        description: "Er is een fout opgetreden bij het verzenden van je bericht",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSwapRequestClick = () => {
    if (!userId) {
      toast({
        title: "Je bent niet ingelogd",
        description: "Log in om een swap-verzoek in te dienen",
        variant: "destructive",
      })
      return
    }

    if (!hasChatted) {
      toast({
        title: "Chat eerst met de eigenaar",
        description: "Je moet eerst contact opnemen met de eigenaar voordat je een swap-verzoek kunt indienen.",
        variant: "destructive",
      })
      return
    }

    router.push(`/homes/${home.id}/swap-request`)
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
            {hostImage ? (
              <Image
                src={hostImage || "/placeholder.svg"}
                alt={home.host_name || home.hostName || ""}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <User className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <CardTitle>Contact opnemen</CardTitle>
            <p className="text-sm text-gray-500">met {home.host_name || home.hostName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {userId ? (
          isOwner ? (
            <div className="text-center py-4">
              <p className="mb-4">Dit is jouw woning</p>
              <Button asChild className="w-full">
                <Link href={`/homes/${home.id}/edit`}>Bewerk woning</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Stuur een bericht naar {home.host_name || home.hostName}
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Stel een vraag of vraag naar beschikbaarheid..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-1">
                    Gewenste datum (optioneel)
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Kies een datum</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Verzenden..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Bericht versturen
                  </>
                )}
              </Button>
            </form>
          )
        ) : (
          <div className="text-center py-4">
            <p className="mb-4">Log in om contact op te nemen met de eigenaar</p>
            <Button asChild className="w-full">
              <Link href="/login">Inloggen</Link>
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4 w-full">
        <p className="text-sm text-gray-500">Gemiddelde reactietijd: binnen 24 uur</p>

        {userId && !isOwner && (
          <>
            <Button
              onClick={handleSwapRequestClick}
              className={`w-full ${
                hasChatted ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
              }`}
            >
              Swap-verzoek indienen
            </Button>
            {isCheckingChat && (
              <p className="text-xs text-gray-500 w-full text-center">Chatgeschiedenis controleren...</p>
            )}
            {!hasChatted && !isCheckingChat && (
              <p className="text-xs text-gray-500 w-full text-center">
                Chat eerst met de eigenaar voordat je een swap-verzoek kunt indienen
              </p>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}
