"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Users, CreditCard, AlertCircle, X } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"

interface SwapRequestFormProps {
  targetHome: any
  userHomes: any[]
}

export function SwapRequestForm({ targetHome, userHomes }: SwapRequestFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [selectedHomeId, setSelectedHomeId] = useState<string>(userHomes.length > 0 ? userHomes[0].id : "")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [guests, setGuests] = useState<number>(1)
  const [message, setMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [isLoadingCredits, setIsLoadingCredits] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Fetch availabilities
  useEffect(() => {
    async function fetchAvailabilities() {
      if (!targetHome?.id) return
      try {
        const response = await fetch(`/api/availabilities?homeId=${targetHome.id}`)
        if (response.ok) {
          const data = await response.json()
          setAvailabilities(data || [])
        }
      } catch (error) {
        console.error("Error fetching availabilities:", error)
      }
    }
    fetchAvailabilities()
  }, [targetHome?.id])

  // Fetch user credits
  useEffect(() => {
    async function fetchUserCredits() {
      if (!session?.user) {
        setIsLoadingCredits(false)
        return
      }
      setIsLoadingCredits(true)
      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          setUserCredits(data.credits)
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
      } finally {
        setIsLoadingCredits(false)
      }
    }
    fetchUserCredits()
  }, [session?.user])

  const availableDateRanges = availabilities.map((availability) => ({
    from: new Date(availability.start_date || availability.startDate),
    to: new Date(availability.end_date || availability.endDate),
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push("/login")
      return
    }

    // Check credits
    if (userCredits !== null && userCredits < 1) {
      setShowModal(true)
      return
    }

    if (!selectedHomeId || !dateRange?.from || !dateRange?.to || !message.trim()) {
      toast({
        title: "Vul alle velden in",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterHomeId: selectedHomeId,
          hostHomeId: targetHome.id,
          hostId: targetHome.user_id,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          guests,
          message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Er is iets misgegaan")
      }

      const exchange = await response.json()

      toast({
        title: "Swap aanvraag verzonden!",
        description: `Je aanvraag is verzonden naar ${targetHome.owner_name}`,
      })

      router.push(`/exchanges/${exchange.id}`)
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/login")} className="w-full">
            Inloggen voor swap
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (userHomes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Je hebt geen woningen om te ruilen.</p>
          <Button onClick={() => router.push("/homes/new")} className="w-full">
            Woning toevoegen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoadingCredits && (
            <div
              className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
                userCredits !== null && userCredits < 1 ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800"
              }`}
            >
              {userCredits !== null && userCredits < 1 ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Je hebt geen credits meer</p>
                    <p className="text-sm">Je hebt credits nodig om een swap aan te vragen.</p>
                  </div>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      Je hebt {userCredits} credit{userCredits !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm">1 credit wordt gebruikt bij het versturen van deze aanvraag.</p>
                  </div>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Je huis</Label>
              <Select value={selectedHomeId} onValueChange={setSelectedHomeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userHomes.map((home) => (
                    <SelectItem key={home.id} value={home.id}>
                      {home.title} - {home.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Datums</Label>
              <DatePickerWithRange
                dateRange={dateRange}
                setDateRange={setDateRange}
                availableDateRanges={availableDateRanges}
              />
            </div>

            <div>
              <Label>Gasten</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Bericht</Label>
              <Textarea
                placeholder={`Hallo ${targetHome.owner_name}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* CONDITIONAL POPUP */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Je hebt credits nodig</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-6 text-gray-600">
              Om een swap aanvraag te versturen heb je credits nodig. Credits helpen ons om spam te voorkomen en zorgen
              ervoor dat alleen serieuze gebruikers aanvragen kunnen doen.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Sluiten
              </Button>
              <Button
                onClick={() => {
                  setShowModal(false)
                  router.push("/credits")
                }}
                className="flex-1"
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
