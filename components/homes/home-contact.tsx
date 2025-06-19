"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { X } from "lucide-react"

interface HomeContactProps {
  homeId: string
}

const HomeContact: React.FC<HomeContactProps> = ({ homeId }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

    fetchUserCredits()
  }, [session?.user])

  const handleFormInteraction = (e: React.MouseEvent | React.FormEvent | React.FocusEvent) => {
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

    if (!handleFormInteraction(e as any)) {
      return
    }

    setIsLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeId,
          name,
          email,
          message,
        }),
      })

      if (response.ok) {
        setSuccessMessage("Bericht succesvol verzonden!")
        setName("")
        setEmail("")
        setMessage("")
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.message || "Er is een fout opgetreden bij het verzenden van het bericht.")
      }
    } catch (error) {
      console.error("Fout bij het verzenden van het bericht:", error)
      setErrorMessage("Er is een fout opgetreden bij het verzenden van het bericht.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-5">Interesse? Neem contact op</h2>
      {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Naam:
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            onClick={handleFormInteraction}
            onFocus={handleFormInteraction}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            onClick={handleFormInteraction}
            onFocus={handleFormInteraction}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">
            Bericht:
          </label>
          <textarea
            id="message"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            onClick={handleFormInteraction}
            onFocus={handleFormInteraction}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Versturen..." : "Verstuur bericht"}
          </button>
        </div>
      </form>

      {/* Credit Modal */}
      {showCreditModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowCreditModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Credits nodig</h2>
              <button onClick={() => setShowCreditModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4">
              Je hebt geen credits meer om een swap verzoek te versturen. Elke swap verzoek kost 1 credit.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowCreditModal(false)} className="px-4 py-2 bg-gray-100 rounded-md">
                Annuleren
              </button>
              <button
                onClick={() => {
                  setShowCreditModal(false)
                  router.push("/credits")
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Credits kopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeContact
