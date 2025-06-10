import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check voor recente videocall uitnodigingen (laatste 5 minuten)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const result = await executeQuery(
      `SELECT m.*, e.id as exchange_id, e.videocall_link
       FROM messages m
       JOIN exchanges e ON m.exchange_id = e.id
       WHERE m.receiver_id = $1
       AND m.message_type IN ('videocall_invite', 'videocall_scheduled')
       AND m.created_at > $2
       AND e.status = 'videocall_scheduled'
       ORDER BY m.created_at DESC
       LIMIT 1`,
      [session.user.id, fiveMinutesAgo],
    )

    if (result.length > 0) {
      const message = result[0]
      let roomUrl = message.videocall_link

      // Als er geen videocall link is in de exchange, probeer deze uit het bericht te halen
      if (!roomUrl) {
        try {
          const messageData = JSON.parse(message.content)
          roomUrl = messageData.link
        } catch (e) {
          console.error("Error parsing message content:", e)
        }
      }

      return NextResponse.json({
        incomingCall: true,
        roomUrl,
        exchangeId: message.exchange_id,
        message,
      })
    }

    return NextResponse.json({ incomingCall: false })
  } catch (error) {
    console.error("Error checking for incoming videocalls:", error)
    return NextResponse.json({ error: "Failed to check for incoming videocalls" }, { status: 500 })
  }
}
