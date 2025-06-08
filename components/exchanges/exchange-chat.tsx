"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Exchange } from "@/types"
import { useSession } from "next-auth/react"
import { trpc } from "@/app/_trpc/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ExchangeChatProps {
  exchange: Exchange
}

const ExchangeChat: React.FC<ExchangeChatProps> = ({ exchange }) => {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<{ senderId: string; text: string; timestamp: Date }[]>([])
  const [newMessage, setNewMessage] = useState("")
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const { mutate: sendMessageMutation, isLoading: isSending } = trpc.message.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("")
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message)
    },
  })

  const { data: initialMessages, refetch: refetchMessages } = trpc.message.getMessages.useQuery(
    { exchangeId: exchange.id },
    {
      refetchOnWindowFocus: false,
    },
  )

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages)
    }
  }, [initialMessages])

  useEffect(() => {
    refetchMessages()
    const intervalId = setInterval(() => {
      refetchMessages()
    }, 5000)

    return () => clearInterval(intervalId)
  }, [exchange.id, refetchMessages])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      sendMessageMutation({
        exchangeId: exchange.id,
        text: newMessage.trim(),
      })
    }
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd MMM yyyy HH:mm", { locale: nl })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 flex flex-col ${message.senderId === session?.user.id ? "items-end" : "items-start"}`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-fit break-words ${
                message.senderId === session?.user.id ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.text}
            </div>
            <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Type je bericht..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage()
              }
            }}
            className="flex-1 mr-2"
          />
          <Button onClick={handleSendMessage} disabled={isSending} className="bg-blue-600 hover:bg-blue-700">
            {isSending ? "Versturen..." : "Versturen"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ExchangeChat
