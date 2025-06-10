"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface ExchangeFormProps {
  exchangeId: string
  onMessageSent?: () => void
  disabled?: boolean
}

export default function ExchangeForm({ exchangeId, onMessageSent, disabled = false }: ExchangeFormProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || isLoading || disabled) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setMessage("")
      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? "Chat is uitgeschakeld" : "Typ je bericht..."}
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          disabled={disabled || isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <Button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="bg-teal-500 hover:bg-teal-600 text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
