"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Users, X, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

interface SwapInterestFormProps {
  homeId: string
  ownerId: string
  homeTitle: string
}

export function SwapInterestForm({ homeId, ownerId, homeTitle }: SwapInterestFormProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Credit state
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)

  // Fetch user credits
  useEffect(() => {
    async function fetchCredits() {
      if (!session?.user) return

      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          setUserCredits(data.credits || 0)
        } else {
          setUserCredits(0)
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
        setUserCredits(0)
      }
    }

    fetchCredits()
  }, [session?.user])

  // Check credits before any form interaction
  const checkCreditsBeforeAction = () => {
    if (userCredits !== null && userCredits < 1) {
      setShowCreditModal(true)
      return false
    }
    return true
  }

  const handleInputFocus = (e: React.FocusEvent) => {
    if (!checkCreditsBeforeAction()) {
      e.target.blur() // Remove focus
    }
  }

  const handleInputClick = (e: React.MouseEvent) => {
    if (!checkCreditsBeforeAction()) {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      alert("Je moet ingelogd zijn")
      router.push("/login")
      return
    }

    if (!checkCreditsBeforeAction()) {
      return
    }

    if (!checkIn || !checkOut) {
      alert("Selecteer datums")
      return
    }

    if (!message.trim()) {
      alert("Voeg een bericht toe")
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

Aankomst: ${checkIn ? format(checkIn, "d MMMM yyyy", { locale: nl }) : ""}
Vertrek: ${checkOut ? format(checkOut, "d MMMM yyyy", { locale: nl }) : ""}
Aantal gasten: ${guests}

${message}

Groeten,
${session.user?.name}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      alert("Bericht verzonden!")

      // Reset form
      setCheckIn(undefined)
      setCheckOut(undefined)
      setGuests(1)
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Er is een fout opgetreden")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Geïnteresseerd in deze woning?</h2>
        <p className="text-sm text-gray-600 mb-4">Geïnteresseerd in een huizenruil?</p>

        {/* Credit warning */}
        {userCredits !== null && userCredits < 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                Je hebt geen credits. Koop credits om swap verzoeken te versturen.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datum selectie */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Aankomst</label>
              <input
                type="date"
                value={checkIn ? format(checkIn, "yyyy-MM-dd") : ""}
                onChange={(e) => setCheckIn(e.target.value ? new Date(e.target.value) : undefined)}
                onFocus={handleInputFocus}
                onClick={handleInputClick}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Vertrek</label>
              <input
                type="date"
                value={checkOut ? format(checkOut, "yyyy-MM-dd") : ""}
                onChange={(e) => setCheckOut(e.target.value ? new Date(e.target.value) : undefined)}
                onFocus={handleInputFocus}
                onClick={handleInputClick}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min={checkIn ? format(checkIn, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          {/* Aantal gasten */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Aantal gasten</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(Number.parseInt(e.target.value) || 1)}
                onFocus={handleInputFocus}
                onClick={handleInputClick}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Bericht */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Bericht</label>
            <textarea
              placeholder="Vertel iets over jezelf en waarom je geïnteresseerd bent in deze woning..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={handleInputFocus}
              onClick={handleInputClick}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Test button */}
          <button
            type="button"
            onClick={() => setShowCreditModal(true)}
            className="w-full mb-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            TEST MODAL
          </button>

          {/* Swap aanvragen knop */}
          <button
            type="submit"
            disabled={isSubmitting || (userCredits !== null && userCredits < 1)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {isSubmitting ? "Verzenden..." : "Swap aanvragen"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Je gegevens worden alleen gedeeld met de eigenaar van deze woning.
          </p>
        </form>
      </div>

      {/* Credit Modal */}
      {showCreditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowCreditModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Credits nodig!</h2>
              <button onClick={() => setShowCreditModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
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
