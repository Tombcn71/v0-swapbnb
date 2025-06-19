"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Users, X, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface HomeContactProps {
  homeId: string
  ownerId: string
  homeTitle: string
}

export function HomeContact({ homeId, ownerId, homeTitle }: HomeContactProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Credit state
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [isLoadingCredits, setIsLoadingCredits] = useState(true)

  // Fetch user credits
  useEffect(() => {
    async function fetchCredits() {
      if (!session?.user) {
        setIsLoadingCredits(false)
        return
      }

      try {
        console.log("Fetching credits for user:", session.user.email) // Debug
        const response = await fetch("/api/credits")

        if (response.ok) {
          const data = await response.json()
          console.log("Credits response:", data) // Debug
          setUserCredits(data.credits || 0)
        } else {
          console.error("Credits API error:", response.status, response.statusText)
          setUserCredits(0)
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
        setUserCredits(0)
      } finally {
        setIsLoadingCredits(false)
      }
    }

    fetchCredits()
  }, [session?.user])

  // Check credits before any form interaction
  const checkCreditsBeforeAction = (e?: React.MouseEvent | React.FocusEvent) => {
    console.log("Checking credits:", userCredits) // Debug

    if (userCredits !== null && userCredits < 1) {
      console.log("No credits - showing modal") // Debug
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      setShowCreditModal(true)
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast({
        title: "Je moet ingelogd zijn",
        description: "Log in om contact op te nemen met de eigenaar.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Check credits first
    if (!checkCreditsBeforeAction()) {
      return
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Selecteer datums",
        description: "Kies je aankomst- en vertrekdatum.",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: "Voeg een bericht toe",
        description: "Schrijf een kort bericht aan de eigenaar.",
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
          recipientId: ownerId,
          content: `Hallo! Ik ben geïnteresseerd in je woning "${homeTitle}".

Aankomst: ${format(checkIn, "d MMMM yyyy", { locale: nl })}
Vertrek: ${format(checkOut, "d MMMM yyyy", { locale: nl })}
Aantal gasten: ${guests}

${message}

Groeten,
${session.user?.name}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast({
        title: "Bericht verzonden!",
        description: "Je bericht is succesvol verzonden naar de eigenaar.",
      })

      // Reset form
      setCheckIn(undefined)
      setCheckOut(undefined)
      setGuests(1)
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (isLoadingCredits) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Geïnteresseerd in deze woning?</CardTitle>
          <p className="text-sm text-muted-foreground">Geïnteresseerd in een huizenruil?</p>

          {/* Debug info */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              Debug: Credits = {userCredits}, Session = {session?.user?.email || "none"}
            </div>
          )}

          {/* Credit warning */}
          {userCredits !== null && userCredits < 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Je hebt geen credits. Koop credits om swap verzoeken te versturen.
                </p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Datum selectie */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aankomst</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !checkIn && "text-muted-foreground")}
                      onClick={(e) => {
                        console.log("Date button clicked") // Debug
                        if (!checkCreditsBeforeAction(e)) {
                          return
                        }
                      }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, "d MMM yyyy", { locale: nl }) : "Selecteer datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Vertrek</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !checkOut && "text-muted-foreground")}
                      onClick={(e) => {
                        console.log("Date button clicked") // Debug
                        if (!checkCreditsBeforeAction(e)) {
                          return
                        }
                      }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, "d MMM yyyy", { locale: nl }) : "Selecteer datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => date < new Date() || (checkIn && date <= checkIn)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Aantal gasten */}
            <div className="space-y-2">
              <Label htmlFor="guests">Aantal gasten</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(e) => setGuests(Number.parseInt(e.target.value) || 1)}
                  onFocus={(e) => {
                    console.log("Input focused") // Debug
                    checkCreditsBeforeAction(e)
                  }}
                  onClick={(e) => {
                    console.log("Input clicked") // Debug
                    checkCreditsBeforeAction(e)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Bericht */}
            <div className="space-y-2">
              <Label htmlFor="message">Bericht</Label>
              <Textarea
                id="message"
                placeholder="Vertel iets over jezelf en waarom je geïnteresseerd bent in deze woning..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={(e) => {
                  console.log("Textarea focused") // Debug
                  checkCreditsBeforeAction(e)
                }}
                onClick={(e) => {
                  console.log("Textarea clicked") // Debug
                  checkCreditsBeforeAction(e)
                }}
                rows={4}
              />
            </div>

            {/* Test button for modal */}
            {process.env.NODE_ENV === "development" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log("Test button clicked - showing modal")
                  setShowCreditModal(true)
                }}
                className="w-full"
              >
                Test Modal (Dev Only)
              </Button>
            )}

            {/* Swap aanvragen knop */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || (userCredits !== null && userCredits < 1)}
            >
              {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Je gegevens worden alleen gedeeld met de eigenaar van deze woning.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Credit Modal */}
      {showCreditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => {
            console.log("Modal backdrop clicked")
            setShowCreditModal(false)
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => {
              console.log("Modal content clicked")
              e.stopPropagation()
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Credits nodig</h2>
              <button
                onClick={() => {
                  console.log("Close button clicked")
                  setShowCreditModal(false)
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-gray-600">
              Je hebt geen credits meer om een swap verzoek te versturen. Elke swap verzoek kost 1 credit.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Waarom credits?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Voorkomt spam verzoeken</li>
                <li>• Zorgt voor serieuze gebruikers</li>
                <li>• Houdt de kwaliteit hoog</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  console.log("Cancel button clicked")
                  setShowCreditModal(false)
                }}
              >
                Annuleren
              </Button>
              <Button
                onClick={() => {
                  console.log("Buy credits button clicked")
                  setShowCreditModal(false)
                  router.push("/credits")
                }}
              >
                Credits kopen
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
