"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Home } from "@/lib/types"

interface HomeContactProps {
  home: Home
  userId?: string
}

export function HomeContact({ home, userId }: HomeContactProps) {
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
        const response = await fetch(`/api/messages/check-history?recipientId=${home.user_id}`)
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
  }, [userId, home.user_id])

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
          recipientId: home.user_id,
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

  const handleSwapRequest = () => {
    // Altijd eerst controleren of er chatcontact is geweest, ongeacht de visuele status van de knop
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

    // Alleen als er chatcontact is geweest, navigeren we naar de swap-verzoek pagina
    router.push(`/homes/${home.id}/swap-request`)
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Contact opnemen</CardTitle>
      </CardHeader>
      <CardContent>
        {userId ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Stuur een bericht naar {home.host_name}
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

        {/* Belangrijk: De knop is NIET disabled, zodat we altijd de toast kunnen tonen */}
        <Button
          onClick={handleSwapRequest}
          className={`w-full ${
            hasChatted ? "bg-google-blue hover:bg-blue-600" : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
          }`}
        >
          Swap-verzoek indienen
        </Button>
        {isCheckingChat && userId && (
          <p className="text-xs text-gray-500 w-full text-center">Chatgeschiedenis controleren...</p>
        )}
        {!hasChatted && !isCheckingChat && userId && (
          <p className="text-xs text-gray-500 w-full text-center">
            Chat eerst met de eigenaar voordat je een swap-verzoek kunt indienen
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
