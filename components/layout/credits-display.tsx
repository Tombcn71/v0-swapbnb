"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Coins } from "lucide-react"
import { useSession } from "next-auth/react"

export function CreditsDisplay() {
  const { data: session } = useSession()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) return

    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          setCredits(data.credits)
        }
      } catch (error) {
        console.error("Error fetching credits:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [session])

  if (!session?.user || loading) {
    return null
  }

  return (
    <Button variant="outline" size="sm" asChild className="flex items-center space-x-2">
      <Link href="/credits">
        <Coins className="h-4 w-4 text-amber-600" />
        <span className="font-medium">{credits ?? 0}</span>
      </Link>
    </Button>
  )
}
