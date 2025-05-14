"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { MessageSquare, Calendar, RefreshCw } from "lucide-react"
import Link from "next/link"

interface HomeContactProps {
  ownerId: string
  ownerName: string
  homeId: string
}

export function HomeContact({ ownerId, ownerName, homeId }: HomeContactProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: "Bericht is verplicht",
        description: "Voer een bericht in voor de eigenaar",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: ownerId,
          content: message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast({
        title: "Bericht verzonden",
        description: `Je bericht is verzonden naar ${ownerName}`,
      })

      // Navigeer naar de berichtenpagina
      router.push(`/messages/${ownerId}`)
    } catch (error) {
      toast({
        title: "Er is iets misgegaan",
        description: "Probeer het later opnieuw",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Bericht aan {ownerName}
        </label>
        <Textarea
          id="message"
          placeholder={`Hallo ${ownerName}, ik ben geïnteresseerd in een huizenruil...`}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          required
        />
      </div>
      <div className="space-y-3">
        <Button type="submit" className="w-full" disabled={isLoading}>
          <MessageSquare className="mr-2 h-4 w-4" />
          {isLoading ? "Bericht verzenden..." : "Stuur bericht"}
        </Button>
        <Button type="button" variant="outline" className="w-full" asChild>
          <Link href={`/homes/${homeId}/exchange`}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Vraag uitwisseling aan
          </Link>
        </Button>
        <Button type="button" variant="outline" className="w-full">
          <Calendar className="mr-2 h-4 w-4" />
          Bekijk beschikbaarheid
        </Button>
      </div>
    </form>
  )
}
