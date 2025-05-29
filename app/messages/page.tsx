import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

interface Conversation {
  other_user_id: string
  other_user_name: string
  last_message_content: string
  last_message_time: string
  unread_count: number
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/messages")
  }

  // Haal alle gesprekken op
  const conversations = await executeQuery(
    `SELECT DISTINCT
       CASE
         WHEN m.sender_id = $1 THEN m.receiver_id
         ELSE m.sender_id
       END as other_user_id,
       CASE
         WHEN m.sender_id = $1 THEN receiver.name
         ELSE sender.name
       END as other_user_name,
       (
         SELECT content
         FROM messages
         WHERE (sender_id = $1 AND receiver_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
            OR (sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AND receiver_id = $1)
         ORDER BY created_at DESC
         LIMIT 1
       ) as last_message_content,
       (
         SELECT created_at
         FROM messages
         WHERE (sender_id = $1 AND receiver_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
            OR (sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AND receiver_id = $1)
         ORDER BY created_at DESC
         LIMIT 1
       ) as last_message_time,
       (
         SELECT COUNT(*)
         FROM messages
         WHERE receiver_id = $1 
           AND sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
           AND read = false
       ) as unread_count
     FROM messages m
     JOIN users sender ON m.sender_id = sender.id
     JOIN users receiver ON m.receiver_id = receiver.id
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY last_message_time DESC`,
    [session.user.id],
  )

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Berichten</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Je hebt nog geen berichten. Stuur een bericht naar een huiseigenaar om te beginnen.
          </div>
        ) : (
          <ul className="divide-y">
            {conversations.map((conversation: Conversation) => (
              <li key={conversation.other_user_id}>
                <Link
                  href={`/messages/${conversation.other_user_id}`}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={`/abstract-geometric-shapes.png?height=48&width=48&query=${conversation.other_user_name}`}
                    />
                    <AvatarFallback>{conversation.other_user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium truncate">{conversation.other_user_name}</h2>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(conversation.last_message_time), {
                          addSuffix: true,
                          locale: nl,
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 truncate">{conversation.last_message_content}</p>
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="ml-4 bg-teal-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
