import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { MessageList } from "@/components/messaging/message-list"
import { ConversationListWrapper } from "@/components/messaging/conversation-list-wrapper"

interface MessagePageProps {
  params: {
    userId: string
  }
}

export default async function MessagePage({ params }: MessagePageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get user details
  const userResult = await executeQuery("SELECT id, name FROM users WHERE id = $1", [params.userId])

  if (userResult.length === 0) {
    redirect("/messages")
  }

  const recipient = userResult[0]

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r hidden md:block">
        <div className="h-full">
          <div className="h-full">
            <ConversationListWrapper />
          </div>
        </div>
      </div>
      <div className="flex-1">
        <MessageList recipientId={recipient.id} recipientName={recipient.name} />
      </div>
    </div>
  )
}
