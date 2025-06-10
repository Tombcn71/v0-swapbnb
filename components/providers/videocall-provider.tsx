"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { VideocallPopup } from "../videocall/videocall-popup"

interface VideocallContextType {
  startVideocall: (exchangeId: string) => Promise<void>
}

const VideocallContext = createContext<VideocallContextType | undefined>(undefined)

export function useVideocall() {
  const context = useContext(VideocallContext)
  if (!context) {
    throw new Error("useVideocall must be used within a VideocallProvider")
  }
  return context
}

export function VideocallProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [activeVideocall, setActiveVideocall] = useState<string | null>(null)
  const [exchangeId, setExchangeId] = useState<string | null>(null)
  const [checkingForCalls, setCheckingForCalls] = useState(false)

  // Check for incoming videocalls
  useEffect(() => {
    if (!session?.user?.id) return

    const checkForVideocalls = async () => {
      if (checkingForCalls) return
      setCheckingForCalls(true)

      try {
        const response = await fetch("/api/videocall/check-incoming")
        if (response.ok) {
          const data = await response.json()
          if (data.incomingCall) {
            setActiveVideocall(data.roomUrl)
            setExchangeId(data.exchangeId)
          }
        }
      } catch (error) {
        console.error("Error checking for videocalls:", error)
      } finally {
        setCheckingForCalls(false)
      }
    }

    // Check immediately and then every 5 seconds
    checkForVideocalls()
    const interval = setInterval(checkForVideocalls, 5000)
    return () => clearInterval(interval)
  }, [session?.user?.id, checkingForCalls])

  const startVideocall = async (exchangeId: string) => {
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/videocall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "instant",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setActiveVideocall(data.roomUrl)
        setExchangeId(exchangeId)
      }
    } catch (error) {
      console.error("Error starting videocall:", error)
    }
  }

  return (
    <VideocallContext.Provider value={{ startVideocall }}>
      {children}
      <VideocallPopup
        roomUrl={activeVideocall}
        exchangeId={exchangeId}
        onClose={() => {
          setActiveVideocall(null)
          setExchangeId(null)
        }}
      />
    </VideocallContext.Provider>
  )
}
