import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import { MessageList } from "@/components/messaging/message-list"

export default async function MessagesPage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/messages")
  }

  // Haal de gebruiker op om de naam te tonen
  const users = await executeQuery("SELECT * FROM users WHERE id = $1", [params.userId])

  if (users.length === 0) {
    redirect("/messages")
  }

  const recipient = users[0]

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-64px)]">
      <div className="bg-white rounded-lg shadow-md h-full overflow-hidden">
        <MessageList recipientId={params.userId} recipientName={recipient.name} />
      </div>
    </div>
  )
}
