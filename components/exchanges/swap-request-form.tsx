"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Users, AlertCircle, X, Calendar } from "lucide-react"

interface SwapRequestFormProps {
  targetHome: any
  userHomes: any[]
}

interface DateRange {
  from?: Date
  to?: Date
}

// Modal Component
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function SwapRequestForm({ targetHome, userHomes }: SwapRequestFormProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [selectedHomeId, setSelectedHomeId] = useState<string>(userHomes.length > 0 ? userHomes[0].id : "")
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [guests, setGuests] = useState<number>(1)
  const [message, setMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [isLoadingCredits, setIsLoadingCredits] = useState(true)
  const [showCreditModal, setShowCreditModal] = useState(false)

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
        } else {
          // Set to 0 for testing if API fails
          setUserCredits(0)
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
        // Set to 0 for testing
        setUserCredits(0)
      } finally {
        setIsLoadingCredits(false)
      }
    }

    fetchUserCredits()
  }, [session?.user])

  const handleFormInteraction = (e: React.MouseEvent | React.FormEvent) => {
    if (userCredits !== null && userCredits < 1) {
      e.preventDefault()
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
    if (!handleFormInteraction(e)) {
      return
    }

    if (!selectedHomeId || !dateRange?.from || !dateRange?.to || !message.trim()) {
      alert("Vul alle velden in")
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
      alert(`Swap aanvraag verzonden naar ${targetHome.owner_name}!`)
      router.push(`/exchanges/${exchange.id}`)
    } catch (error: any) {
      alert(`Fout: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBuyCredits = () => {
    setShowCreditModal(false)
    router.push("/credits")
  }

  if (!session) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Swap aanvragen</h3>
        </div>
        <div className="p-6">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Inloggen voor swap
          </button>
        </div>
      </div>
    )
  }

  if (userHomes.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Swap aanvragen</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">Je hebt geen woningen om te ruilen.</p>
          <button
            onClick={() => router.push("/homes/new")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Woning toevoegen
          </button>
        </div>
      </div>
    )
  }

  if (isLoadingCredits) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Swap aanvragen</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
            <span className="ml-3">Credits laden...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Swap aanvragen</h3>
          {userCredits !== null && (
            <p className="text-sm text-gray-600 mt-1">
              Credits beschikbaar: <span className="font-semibold">{userCredits}</span>
            </p>
          )}
        </div>
        <div className="p-6">
          {/* Credit warning banner */}
          {userCredits !== null && userCredits < 1 && (
            <div
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={handleBuyCredits}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">Geen credits beschikbaar</p>
                  <p className="text-sm text-amber-700">Klik hier om credits te kopen voor swap aanvragen</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Je huis</label>
              <select
                value={selectedHomeId}
                onChange={(e) => setSelectedHomeId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={handleFormInteraction}
                required
              >
                {userHomes.map((home) => (
                  <option key={home.id} value={home.id}>
                    {home.title} - {home.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Check-in datum
              </label>
              <input
                type="date"
                value={dateRange.from ? dateRange.from.toISOString().split("T")[0] : ""}
                onChange={(e) => setDateRange((prev) => ({ ...prev, from: new Date(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={handleFormInteraction}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Check-out datum
              </label>
              <input
                type="date"
                value={dateRange.to ? dateRange.to.toISOString().split("T")[0] : ""}
                onChange={(e) => setDateRange((prev) => ({ ...prev, to: new Date(e.target.value) }))}
                min={dateRange.from ? dateRange.from.toISOString().split("T")[0] : ""}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={handleFormInteraction}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Aantal gasten
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={handleFormInteraction}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Persoonlijk bericht</label>
              <textarea
                placeholder={`Hallo ${targetHome.owner_name}, ik zou graag mijn huis willen ruilen met jouw mooie woning...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                onClick={handleFormInteraction}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (userCredits !== null && userCredits < 1)}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                isSubmitting || (userCredits !== null && userCredits < 1)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Verzenden...
                </div>
              ) : (
                "Swap aanvragen"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Credit Modal */}
      <Modal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} title="Geen credits beschikbaar">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Credits vereist</p>
              <p className="text-sm text-amber-700">
                Je hebt geen credits meer om een swap aan te vragen. Koop credits om door te gaan met je aanvraag.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Wat zijn credits?</h4>
            <p className="text-sm text-gray-600">
              Credits gebruik je om swap aanvragen te versturen. Elke aanvraag kost 1 credit. Dit houdt de kwaliteit van
              aanvragen hoog en voorkomt spam.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleBuyCredits}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Credits kopen
            </button>
            <button
              onClick={() => setShowCreditModal(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              Annuleren
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
