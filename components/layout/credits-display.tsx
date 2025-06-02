"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Coins } from "lucide-react"
import Link from "next/link"

interface CreditsData {
  credits: number
  transactions: any[]
}

export function CreditsDisplay() {
  const { data: session } = useSession()
  const [creditsData, setCreditsData] = useState<CreditsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchCredits()
    }
  }, [session])

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/credits")
      if (response.ok) {
        const data = await response.json()
        setCreditsData(data)
      }
    } catch (error) {
      console.error("Error fetching credits:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user || loading) {
    return null
  }

  return (
    <Link
      href="/credits"
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
    >
      <Coins className="h-4 w-4 text-amber-600" />
      <span className="text-sm font-medium text-amber-800">{creditsData?.credits || 0} credits</span>
    </Link>
  )
}
