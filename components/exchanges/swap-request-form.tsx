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
import { Users, AlertCircle, CreditCard } from "lucide-react"
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
  const [isLoadingCredits, setIsLoadingCredits] = useState(true)

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

  // Auto-show modal when credits are loaded and insufficient
  useEffect(() => {
    if (session?.user && !isLoadingCredits && userCredits !== null && userCredits < 1) {
      setShowCreditModal(true)
    }
  }, [session?.user, isLoadingCredits, userCredits])

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
    if (!isLoadingCredits && userCredits !== null && userCredits < 1) {
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
      <Card>
        <CardHeader>
          <CardTitle>Swap aanvragen</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Credits info banner */}
          {!isLoadingCredits && (
            <div
              className={`mb-4 p-3 rounded-md flex items-center gap-2 cursor-pointer ${
                userCredits !== null && userCredits < 1
                  ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "bg-green-50 text-green-800 hover:bg-green-100"
              }`}
              onClick={() => setShowCreditModal(true)}
            >
              {userCredits !== null && userCredits < 1 ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Je hebt geen credits meer</p>
                    <p className="text-sm">
                      Klik hier om te leren waarom we credits gebruiken en hoe je ze kunt kopen.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      Je hebt {userCredits} credit{userCredits !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm">
                      1 credit wordt gebruikt bij het versturen van deze aanvraag.{" "}
                      <span
                        className="underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCreditModal(true)
                        }}
                      >
                        Meer info
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Loading state */}
          {isLoadingCredits && (
            <div className="mb-4 p-3 rounded-md bg-gray-100 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
              <span>Credits laden...</span>
            </div>
          )}

          {/* Form with overlay */}
          <div className="relative">
            {/* Overlay that blocks form when no credits */}
            {!isLoadingCredits && userCredits !== null && userCredits < 1 && (
              <div
                className="absolute inset-0 bg-white bg-opacity-75 z-10 flex flex-col items-center justify-center p-4 rounded-md cursor-pointer"
                onClick={() => setShowCreditModal(true)}
              >
                <AlertCircle className="h-10 w-10 text-amber-600 mb-2" />
                <p className="text-xl font-semibold text-gray-800 text-center">Geen credits beschikbaar</p>
                <p className="text-gray-600 text-center mt-1">Klik hier om credits te kopen</p>
              </div>
            )}

            {/* The actual form */}
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
                disabled={isSubmitting || isLoadingCredits || (userCredits !== null && userCredits < 1)}
              >
                {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
