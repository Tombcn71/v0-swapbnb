"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle, Bell } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface Conversation {
  other_user_id: string
  other_user_name: string
  last_message_content: string
  last_message_time: string
  unread_count: number
}

export function ConversationList() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [previousConversations, setPreviousConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const fetchConversations = async () => {
    if (status !== "authenticated") return

    setIsLoading(true)
    try {
      setError(null)
      console.log("Fetching conversations")
      const response = await fetch("/api/messages")

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.error || "Failed to fetch conversations")
      }

      const data = await response.json()
      console.log("Fetched conversations:", data)

      // Controleer op nieuwe berichten
      if (previousConversations.length > 0) {
        let newMessageCount = 0
        let latestSender = ""

        data.forEach((conv: Conversation) => {
          const prevConv = previousConversations.find((pc) => pc.other_user_id === conv.other_user_id)

          if (prevConv) {
            // Als er nieuwe ongelezen berichten zijn
            const newUnreadCount = conv.unread_count - prevConv.unread_count
            if (newUnreadCount > 0) {
              newMessageCount += newUnreadCount
              latestSender = conv.other_user_name
            }
          }
        })

        // Toon notificatie als er nieuwe berichten zijn
        if (newMessageCount > 0) {
          const title =
            newMessageCount === 1 ? `Nieuw bericht van ${latestSender}` : `${newMessageCount} nieuwe berichten`

          const description =
            newMessageCount === 1
              ? `Je hebt een nieuw bericht ontvangen van ${latestSender}`
              : `Je hebt ${newMessageCount} nieuwe berichten ontvangen`

          toast({
            title,
            description,
            icon: <Bell className="h-4 w-4" />,
          })

          // Speel een geluid af (optioneel)
          const audio = new Audio("/notification-sound.mp3")
          audio.play().catch((e) => console.log("Audio play failed:", e))

          // Update de document titel om de aandacht te trekken
          if (document.hidden) {
            const originalTitle = document.title
            document.title = `(${newMessageCount}) Nieuwe berichten - SwapBnB`

            // Reset de titel wanneer de gebruiker terugkeert naar het tabblad
            const handleVisibilityChange = () => {
              if (!document.hidden) {
                document.title = originalTitle
                document.removeEventListener("visibilitychange", handleVisibilityChange)
              }
            }

            document.addEventListener("visibilitychange", handleVisibilityChange)
          }
        }
      }

      setPreviousConversations(data)
      setConversations(data)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setError("Er is een fout opgetreden bij het ophalen van gesprekken. Probeer het later opnieuw.")
      toast({
        title: "Fout bij het laden van gesprekken",
        description: "Er is een fout opgetreden bij het ophalen van gesprekken. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations()
      // Set up polling for new messages
      const interval = setInterval(fetchConversations, 30000)
      return () => clearInterval(interval)
    }
  }, [status])

  const filteredConversations = conversations.filter((conversation) =>
    conversation.other_user_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectConversation = (userId: string) => {
    router.push(`/messages/${userId}`)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-t-teal-500 border-r-transparent border-b-teal-500 border-l-transparent rounded-full mx-auto mb-4"></div>
          <p>Gesprekken laden...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p>Je moet ingelogd zijn om gesprekken te bekijken.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Zoek gesprekken..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!error && filteredConversations.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            {searchTerm ? "Geen gesprekken gevonden" : "Nog geen gesprekken"}
          </div>
        ) : (
          <ul className="divide-y">
            {filteredConversations.map((conversation) => (
              <li key={conversation.other_user_id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start p-3 h-auto ${conversation.unread_count > 0 ? "bg-teal-50" : ""}`}
                  onClick={() => handleSelectConversation(conversation.other_user_id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=40&width=40&query=${conversation.other_user_name}`}
                      />
                      <AvatarFallback>{conversation.other_user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className={`font-medium truncate ${conversation.unread_count > 0 ? "font-bold" : ""}`}>
                          {conversation.other_user_name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.last_message_time), {
                            addSuffix: true,
                            locale: nl,
                          })}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${conversation.unread_count > 0 ? "text-black font-medium" : "text-gray-600"}`}
                      >
                        {conversation.last_message_content}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <div className="bg-teal-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
