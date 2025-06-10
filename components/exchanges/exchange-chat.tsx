"use client"

import type React from "react"
import { useState } from "react"

interface Exchange {
  id: string
  // other properties
}

interface User {
  id: string
  // other properties
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  // other properties
}

interface ExchangeChatProps {
  exchange: Exchange
  initialMessages?: Message[]
  otherUser: User
}

export function ExchangeChat({ exchange, initialMessages, otherUser }: ExchangeChatProps) {
  const [messages, setMessages] = useState(initialMessages || [])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQuickReplies, setShowQuickReplies] = useState(false)

  const sendMessage = async (content: string, isQuickReply = false) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const newMsg = await response.json()
      setMessages((prev) => [...prev, newMsg])
      setNewMessage("")

      if (isQuickReply) {
        setShowQuickReplies(false)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(newMessage)
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply, true)
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>{msg.content}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea value={newMessage} onChange={handleInputChange} placeholder="Type your message..." />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>

      <button onClick={() => setShowQuickReplies(!showQuickReplies)}>
        {showQuickReplies ? "Hide Quick Replies" : "Show Quick Replies"}
      </button>

      {showQuickReplies && (
        <div>
          <button onClick={() => handleQuickReply("Interested")}>Interested</button>
          <button onClick={() => handleQuickReply("Not Interested")}>Not Interested</button>
        </div>
      )}
    </div>
  )
}
