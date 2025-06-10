"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender: {
    name: string
    profile_picture?: string
  }
}

interface ExchangeMessagesProps {
  exchangeId: string
  messages: Message[]
  currentUserId: string
  otherUser: {
    id: string
    name: string
    profile_picture?: string
  }
  onQuickReply?: (message: string) => void
  showQuickReplies?: boolean
}

export default function ExchangeMessages({
  exchangeId,
  messages,
  currentUserId,
  otherUser,
  onQuickReply,
  showQuickReplies = false,
}: ExchangeMessagesProps) {
  const [allMessages, setAllMessages] = useState(messages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [allMessages])

  useEffect(() => {
    setAllMessages(messages)
  }, [messages])

  const handleQuickReply = async (message: string) => {
    if (onQuickReply) {
      onQuickReply(message)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.map((message) => {
          const isCurrentUser = message.sender_id === currentUserId

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={isCurrentUser ? undefined : otherUser.profile_picture}
                    alt={isCurrentUser ? "You" : otherUser.name}
                  />
                  <AvatarFallback className="bg-teal-100 text-teal-700">
                    {isCurrentUser ? "U" : otherUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    isCurrentUser ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? "text-teal-100" : "text-gray-500"}`}>
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: nl,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {showQuickReplies && (
          <div className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Snelle antwoorden:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply("Ja, laten we praten over de details!")}
                className="text-teal-600 border-teal-200 hover:bg-teal-50"
              >
                Ja, laten we praten
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply("Nee, helaas past dit niet bij mij.")}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Nee, helaas niet
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
