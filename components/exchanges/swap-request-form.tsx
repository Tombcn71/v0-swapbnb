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
import { Users, AlertCircle } from "lucide-react"
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
  const [showCreditModal, setShowCreditModal] = useState(false)

  // Fetch user credits
  useEffect(() => {
    async function fetchUserCredits() {
      if (!session?.user) return

      try {
        console.log("Fetching credits for user:", session.user.email)
        const response = await fetch("/api/credits")
        console.log("Credits API response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Credits API data:", data)
          setUserCredits(data.credits)
          console.log("Set userCredits to:", data.credits)

          // Test: force modal if credits are 0
          if (data.credits === 0) {
            console.log("User has 0 credits, should show modal")
            setShowCreditModal(true)
          }
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
      }
    }

    fetchUserCredits()
  }, [session?.user])

  // Fetch availabilities for the target home
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

  // Convert availabilities to DateRange format
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

    // Check credits before submission
    if (userCredits !== null && userCredits < 1) {
      setShowCreditModal(true)
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
      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-bold">Credits nodig</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Je hebt niet genoeg credits om deze swap aan te vragen. Elke swap kost 1 credit.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreditModal(false)}>
                Sluiten
              </Button>
              <Button onClick={() => router.push("/credits")}>Credits kopen</Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Credit warning banner */}
          {userCredits !== null && userCredits < 1 && (
            <div
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 cursor-pointer hover:bg-amber-100"
              onClick={() => setShowCreditModal(true)}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Geen credits beschikbaar</p>
                  <p className="text-sm text-amber-700">Klik hier om credits te kopen</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Je huis</Label>
              <Select
                value={selectedHomeId}
                onValueChange={setSelectedHomeId}
                onOpenChange={() => {
                  console.log("Form element clicked, userCredits:", userCredits)
                  if (userCredits !== null && userCredits < 1) {
                    console.log("Opening modal because userCredits < 1")
                    setShowCreditModal(true)
                  } else {
                    console.log("Not opening modal, userCredits:", userCredits)
                  }
                }}
              >
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
              <div
                onClick={() => {
                  console.log("Form element clicked, userCredits:", userCredits)
                  if (userCredits !== null && userCredits < 1) {
                    console.log("Opening modal because userCredits < 1")
                    setShowCreditModal(true)
                  } else {
                    console.log("Not opening modal, userCredits:", userCredits)
                  }
                }}
              >
                <DatePickerWithRange
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  availableDateRanges={availableDateRanges}
                />
              </div>
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
                  onClick={() => {
                    console.log("Form element clicked, userCredits:", userCredits)
                    if (userCredits !== null && userCredits < 1) {
                      console.log("Opening modal because userCredits < 1")
                      setShowCreditModal(true)
                    } else {
                      console.log("Not opening modal, userCredits:", userCredits)
                    }
                  }}
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
                onClick={() => {
                  console.log("Form element clicked, userCredits:", userCredits)
                  if (userCredits !== null && userCredits < 1) {
                    console.log("Opening modal because userCredits < 1")
                    setShowCreditModal(true)
                  } else {
                    console.log("Not opening modal, userCredits:", userCredits)
                  }
                }}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
