import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scheduled_at, videocall_link, type = "scheduled" } = await request.json()
    const exchangeId = params.id

    // Controleer toegang
    const exchange = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, session.user.id],
    )

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    // Genereer Jitsi Meet link
    const timestamp = type === "instant" ? Date.now() : new Date(scheduled_at).getTime()
    const jitsiLink = videocall_link || `https://meet.jit.si/swapbnb-${exchangeId.substring(0, 8)}-${timestamp}`

    if (type === "scheduled") {
      // Update exchange met geplande videocall
      await executeQuery(
        `UPDATE exchanges 
         SET videocall_scheduled_at = $1, 
             videocall_link = $2,
             updated_at = NOW() 
         WHERE id = $3`,
        [scheduled_at, jitsiLink, exchangeId],
      )

      // Voeg automatisch bericht toe aan chat
      const scheduledDate = new Date(scheduled_at).toLocaleString("nl-NL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      await executeQuery(
        `INSERT INTO messages (sender_id, receiver_id, exchange_id, content, message_type)
         VALUES ($1, $2, $3, $4, 'videocall_scheduled')`,
        [
          session.user.id,
          exchange[0].requester_id === session.user.id ? exchange[0].host_id : exchange[0].requester_id,
          exchangeId,
          `📹 Videocall gepland voor ${scheduledDate}\n\nJoin link: ${jitsiLink}`,
        ],
      )
    } else if (type === "instant") {
      // Voeg direct call bericht toe aan chat
      await executeQuery(
        `INSERT INTO messages (sender_id, receiver_id, exchange_id, content, message_type)
         VALUES ($1, $2, $3, $4, 'videocall_invite')`,
        [
          session.user.id,
          exchange[0].requester_id === session.user.id ? exchange[0].host_id : exchange[0].requester_id,
          exchangeId,
          `📞 ${session.user.name} wil nu videobellen!\n\nKlik hier om mee te doen: ${jitsiLink}`,
        ],
      )
    }

    return NextResponse.json({
      success: true,
      scheduledAt: scheduled_at,
      meetingLink: jitsiLink,
      type,
    })
  } catch (error) {
    console.error("Error scheduling videocall:", error)
    return NextResponse.json({ error: "Failed to schedule videocall" }, { status: 500 })
  }
}
