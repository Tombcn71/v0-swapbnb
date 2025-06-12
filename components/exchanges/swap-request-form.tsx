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
  const [isLoading, setIsLoading] = useState(true)

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

  // Fetch user credits
  useEffect(() => {
    async function fetchUserCredits() {
      if (!session?.user) return
      setIsLoading(true)

      try {
        console.log("Fetching credits for user:", session.user.email)
        const response = await fetch("/api/credits")

        if (response.ok) {
          const data = await response.json()
          console.log("Credits API response:", data)
          setUserCredits(data.credits)

          // Force a re-render by setting state
          if (data.credits < 1) {
            console.log("User has insufficient credits:", data.credits)
            // Show a toast to make it obvious
            toast({
              title: "Let op: Je hebt geen credits",
              description: "Je hebt credits nodig om een swap aan te vragen",
              variant: "destructive",
            })
          } else {
            console.log("User has sufficient credits:", data.credits)
          }
        } else {
          console.error("Failed to fetch credits:", response.status)
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserCredits()
  }, [session?.user, toast])

  // Convert availabilities to DateRange format
  const availableDateRanges = availabilities.map((availability) => ({
    from: new Date(availability.start_date || availability.startDate),
    to: new Date(availability.end_date || availability.endDate),
  }))

  const handleCreditCheck = () => {
    console.log("Credit check triggered, userCredits:", userCredits)
    if (userCredits !== null && userCredits < 1) {
      console.log("Opening credit modal")
      setShowCreditModal(true)
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push("/login")
      return
    }

    // Check credits before submission
    if (!handleCreditCheck()) {
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

  // Show a clear message if user has no credits
  if (!isLoading && userCredits !== null && userCredits < 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Credits nodig
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800 mb-2">Je hebt geen credits om een swap aan te vragen.</p>
            <p className="text-sm text-red-600">Elke swap kost 1 credit.</p>
          </div>
          <Button onClick={() => router.push("/credits")} className="w-full bg-green-600 hover:bg-green-700">
            Credits kopen
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
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

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                onClick={(e) => {
                  if (!handleCreditCheck()) {
                    e.preventDefault()
                  }
                }}
              >
                {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Credits nodig</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Je hebt niet genoeg credits om deze swap aan te vragen. Elke swap kost 1 credit.</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreditModal(false)}>
                  Sluiten
                </Button>
                <Button
                  onClick={() => {
                    router.push("/credits")
                    setShowCreditModal(false)
                  }}
                >
                  Credits kopen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
