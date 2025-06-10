// API Route: /api/exchanges/[id]/videocall/route.ts
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

    // Haal exchange details op
    const exchange = await executeQuery(
      `SELECT e.*, 
              r.name as requester_name, 
              h.name as host_name
       FROM exchanges e
       JOIN users r ON e.requester_id = r.id
       JOIN users h ON e.host_id = h.id
       WHERE e.id = $1 AND (e.requester_id = $2 OR e.host_id = $2)`,
      [exchangeId, session.user.id],
    )

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchangeData = exchange[0]

    // Bepaal wie de ontvanger is (de andere persoon in de exchange)
    const isRequester = exchangeData.requester_id === session.user.id
    const receiverId = isRequester ? exchangeData.host_id : exchangeData.requester_id
    const receiverName = isRequester ? exchangeData.host_name : exchangeData.requester_name

    // Genereer Google Meet link (simplified - in production you'd use Google Calendar API)
    const timestamp = type === "instant" ? Date.now() : new Date(scheduled_at).getTime()
    const meetLink = videocall_link || `https://meet.google.com/new`

    if (type === "scheduled") {
      // Update exchange met geplande videocall
      await executeQuery(
        `UPDATE exchanges 
         SET videocall_scheduled_at = $1, 
             videocall_link = $2,
             status = 'videocall_scheduled',
             updated_at = NOW() 
         WHERE id = $3`,
        [scheduled_at, meetLink, exchangeId],
      )

      const scheduledDate = new Date(scheduled_at).toLocaleString("nl-NL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      // Videocall bericht naar de ontvanger
      await executeQuery(
        `INSERT INTO messages (sender_id, receiver_id, exchange_id, content, message_type, created_at)
         VALUES ($1, $2, $3, $4, 'videocall_scheduled', NOW())`,
        [
          session.user.id,
          receiverId,
          exchangeId,
          JSON.stringify({
            type: "videocall_scheduled",
            text: `📹 ${session.user.name} heeft een Google Meet gepland voor ${scheduledDate}`,
            link: meetLink,
            linkText: "Klik hier om deel te nemen",
            scheduledAt: scheduled_at,
          }),
        ],
      )
    } else if (type === "instant") {
      // Update status naar videocall_scheduled
      await executeQuery(
        `UPDATE exchanges 
         SET videocall_link = $1,
             status = 'videocall_scheduled',
             updated_at = NOW() 
         WHERE id = $2`,
        [meetLink, exchangeId],
      )

      // Videocall bericht naar de ontvanger
      await executeQuery(
        `INSERT INTO messages (sender_id, receiver_id, exchange_id, content, message_type, created_at)
         VALUES ($1, $2, $3, $4, 'videocall_invite', NOW())`,
        [
          session.user.id,
          receiverId,
          exchangeId,
          JSON.stringify({
            type: "videocall_invite",
            text: `📞 ${session.user.name} wil nu videobellen via Google Meet!`,
            link: meetLink,
            linkText: "Klik hier om mee te doen",
          }),
        ],
      )
    }

    return NextResponse.json({
      success: true,
      scheduledAt: scheduled_at,
      type,
      receiverId,
      receiverName,
      message: `Google Meet ${type === "instant" ? "uitnodiging verstuurd" : "gepland"} naar ${receiverName}`,
      meetingLink: meetLink,
    })
  } catch (error) {
    console.error("Error scheduling videocall:", error)
    return NextResponse.json({ error: "Failed to schedule videocall" }, { status: 500 })
  }
}
