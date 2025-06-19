"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Users, X, AlertCircle } from "lucide-react"

interface HomeContactProps {
  homeId: string
  ownerId: string
  ownerName: string
}

export function HomeContactWithCredits({ homeId, ownerId, ownerName }: HomeContactProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [arrivalDate, setArrivalDate] = useState("")
  const [departureDate, setDepartureDate] = useState("")
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [isLoadingCredits, setIsLoadingCredits] = useState(true)
  const [showCreditModal, setShowCreditModal] = useState(false)

  // Fetch user credits
  useEffect(() => {
    async function fetchUserCredits() {
      try {
        if (session?.user) {
          const response = await fetch("/api/credits")
          if (response.ok) {
            const data = await response.json()
            setUserCredits(data.credits)
          } else {
            setUserCredits(0)
          }
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
        setUserCredits(0)
      } finally {
        setIsLoadingCredits(false)
      }
    }

    if (session?.user) {
      fetchUserCredits()
    } else {
      setIsLoadingCredits(false)
    }
  }, [session?.user])

  const handleFormInteraction = (e: any) => {
    if (userCredits !== null && userCredits < 1) {
      e.preventDefault()
      e.stopPropagation()
      setShowCreditModal(true)
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!handleFormInteraction(e)) {
      return
    }

    if (!arrivalDate || !departureDate || !message.trim()) {
      alert("Vul alle velden in")
      return
    }

    setIsSubmitting(true)

    try {
      // Your existing submit logic here
      alert(`Swap aanvraag verzonden naar ${ownerName}!`)
    } catch (error: any) {
      alert(`Fout: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-xl font-semibold mb-4">Geïnteresseerd in deze woning?</h3>
        <p className="text-gray-600 mb-4">Log in om een swap verzoek te versturen</p>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Inloggen
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-xl font-semibold mb-2">Geïnteresseerd in deze woning?</h3>
        <p className="text-gray-600 mb-6">Geïnteresseerd in een huizenruil?</p>

        {/* Credit warning */}
        {userCredits !== null && userCredits < 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Geen credits beschikbaar</p>
                <p className="text-sm text-amber-700">Je hebt credits nodig om swap verzoeken te versturen</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aankomst</label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => {
                  if (handleFormInteraction(e)) {
                    setArrivalDate(e.target.value)
                  }
                }}
                onClick={handleFormInteraction}
                onFocus={handleFormInteraction}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vertrek</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => {
                  if (handleFormInteraction(e)) {
                    setDepartureDate(e.target.value)
                  }
                }}
                onClick={handleFormInteraction}
                onFocus={handleFormInteraction}
                min={arrivalDate}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aantal gasten</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => {
                  if (handleFormInteraction(e)) {
                    setGuests(Number(e.target.value) || 1)
                  }
                }}
                onClick={handleFormInteraction}
                onFocus={handleFormInteraction}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bericht</label>
            <textarea
              value={message}
              onChange={(e) => {
                if (handleFormInteraction(e)) {
                  setMessage(e.target.value)
                }
              }}
              onClick={handleFormInteraction}
              onFocus={handleFormInteraction}
              placeholder="Vertel iets over jezelf en waarom je geïnteresseerd bent in deze woning..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (userCredits !== null && userCredits < 1)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isSubmitting || (userCredits !== null && userCredits < 1)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Je gegevens worden alleen gedeeld met de eigenaar van deze woning.
        </p>
      </div>

      {/* Credit Modal */}
      {showCreditModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowCreditModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Credits nodig</h2>
              <button onClick={() => setShowCreditModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Je hebt geen credits meer om een swap verzoek te versturen. Elke swap verzoek kost 1 credit.
              </p>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Waarom credits?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Voorkomt spam verzoeken</li>
                  <li>• Zorgt voor serieuze gebruikers</li>
                  <li>• Houdt de kwaliteit hoog</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreditModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  setShowCreditModal(false)
                  router.push("/credits")
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Credits kopen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
