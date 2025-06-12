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
  const [isLoadingCredits, setIsLoadingCredits] = useState(true)

  // Fetch user credits
  useEffect(() => {
    async function fetchUserCredits() {
      if (!session?.user) {
        setIsLoadingCredits(false)
        return
      }

      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          setUserCredits(data.credits)

          // Redirect to credits page if user has 0 credits
          if (data.credits === 0) {
            router.push("/credits?reason=swap")
            return
          }
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
      } finally {
        setIsLoadingCredits(false)
      }
    }

    fetchUserCredits()
  }, [session?.user, router])

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

  const handleFormClick = () => {
    if (userCredits !== null && userCredits < 1) {
      router.push("/credits?reason=swap")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push("/login")
      return
    }

    // Check credits before submission
    if (userCredits !== null && userCredits < 1) {
      router.push("/credits?reason=swap")
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

  if (isLoadingCredits) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
            <span className="ml-3">Credits laden...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Swap aanvragen</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Credit warning banner */}
        {userCredits !== null && userCredits < 1 && (
          <div
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 cursor-pointer hover:bg-amber-100"
            onClick={() => router.push("/credits?reason=swap")}
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

        <div onClick={handleFormClick}>
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
        </div>
      </CardContent>
    </Card>
  )
}
