"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Users } from "lucide-react"
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
  const [creditsFetched, setCreditsFetched] = useState(false)

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

      try {
        console.log("Fetching credits...")
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          console.log("Credits response:", data)
          setUserCredits(data.credits)
          setCreditsFetched(true)
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
      }
    }

    fetchUserCredits()
  }, [session?.user])

  // Convert availabilities to DateRange format
  const availableDateRanges = availabilities.map((availability) => ({
    from: new Date(availability.start_date || availability.startDate),
    to: new Date(availability.end_date || availability.endDate),
  }))

  // Check if user has enough credits
  const checkCredits = useCallback(() => {
    console.log("Checking credits:", userCredits)
    if (creditsFetched && userCredits !== null && userCredits < 1) {
      console.log("No credits, showing modal")
      setShowCreditModal(true)
      return false
    }
    return true
  }, [userCredits, creditsFetched])

  // Handle any click on form elements
  const handleFormElementClick = (e: React.MouseEvent) => {
    console.log("Form element clicked")
    if (!checkCredits()) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")

    if (!session) {
      router.push("/login")
      return
    }

    // Check credits first
    if (!checkCredits()) {
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

  // Hardcoded check for testing - remove in production
  if (creditsFetched && userCredits === 0) {
    // Force modal to show for testing
    setTimeout(() => {
      setShowCreditModal(true)
    }, 500)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div onClick={handleFormElementClick}>
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

            <div onClick={handleFormElementClick}>
              <Label>Datums</Label>
              <DatePickerWithRange
                dateRange={dateRange}
                setDateRange={setDateRange}
                availableDateRanges={availableDateRanges}
              />
            </div>

            <div onClick={handleFormElementClick}>
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

            <div onClick={handleFormElementClick}>
              <Label>Bericht</Label>
              <Textarea
                placeholder={`Hallo ${targetHome.owner_name}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting} onClick={handleFormElementClick}>
              {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Credits nodig</h2>
            <p className="mb-4">Je hebt niet genoeg credits om deze swap aan te vragen. Elke swap kost 1 credit.</p>
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
          </div>
        </div>
      )}
    </>
  )
}
