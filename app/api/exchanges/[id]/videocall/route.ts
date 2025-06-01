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

    // Get exchange details
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
    
    // Determine who is the receiver (the other person in the exchange)
    const isRequester = exchangeData.requester_id === session.user.id
    const receiverId = isRequester ? exchangeData.host_id : exchangeData.requester_id
    const receiverName = isRequester ? exchangeData.host_name : exchangeData.requester_name

    // Generate Jitsi Meet link
    const timestamp = type === "instant" ? Date.now() : new Date(scheduled_at).getTime()
    const jitsiLink = videocall_link || `https://meet.jit.si/swapbnb-${exchangeId.substring(0, 8)}-${timestamp}`

    if (type === "scheduled") {
      // Update exchange with scheduled videocall
      await executeQuery(
        `UPDATE exchanges 
         SET videocall_scheduled_at = $1, 
             videocall_link = $2,
             updated_at = NOW() 
         WHERE id = $3`,
        [scheduled_at, jitsiLink, exchangeId],
      )

      // Add scheduled call message to chat - sent TO the other person
      const scheduledDate = new Date(scheduled_at).toLocaleString("nl-NL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      // Message appears in the OTHER person's chat (they receive it)
      await executeQuery(
        `INSERT INTO messages (sender_id, receiver_id, exchange_id, content, message_type, created_at)
         VALUES ($1, $2, $3, $4, 'videocall_scheduled', NOW())`,
        [
          session.user.id,           // You are sending
          receiverId,               // They are receiving
          exchangeId,
          `📹 Videocall gepland voor ${scheduledDate}\n\n🔗 <a href="${jitsiLink}" target="_blank" rel="noopener noreferrer" class="videocall-link">Klik hier om deel te nemen</a>`,
        ],
      )

      // OPTIONAL: Add a confirmation message to YOUR chat
      await executeQuery(
        `INSERT INTO messages (sender_id, receiver_id, exchange_id, content, message_type, created_at)
         VALUES ($1, $2, $3, $4, 'videocall_confirmation', NOW())`,
        [
          session.user.id,           // System message to you
          session.user.id,           // You receive it
          exchangeId,
          `✅ Videocall gepland voor ${scheduledDate}. ${receiverName} heeft een uitnodiging ontvangen.`,
        ],
      )

    } else if (type === "instant") {
      // Add instant call message - sent TO the other person
      await executeQuery(
        `INSERT INTO messages (sender_id, receiver_id, exchange_id, content, message_type, created_at)
         VALUES ($1, $2, $3, $4, 'videocall_invite', NOW())`,
        [
          session.user.id,           // You are sending
          receiverId,               // They are receiving  
          exchangeId,
          `📞 ${session.user.name} wil nu videobellen!\n\n🔗 <a href="${jitsiLink}" target="_blank" rel="noopener noreferrer" class="videocall-link">Klik hier om mee te doen</a>`,
        ],
      )

      // OPTIONAL: Add a "calling..." message to YOUR chat
      await executeQuery(
        `INSERT INTO messages (sender_id, receiver_id, exchange_id, content, message_type, created_at)
         VALUES ($1, $2, $3, $4, 'videocall_calling', NOW())`,
        [
          session.user.id,           // System message to you
          session.user.id,           // You receive it
          exchangeId,
          `📞 Videocall uitnodiging verstuurd naar ${receiverName}...`,
        ],
      )
    }

    return NextResponse.json({
      success: true,
      scheduledAt: scheduled_at,
      meetingLink: jitsiLink,
      type,
      receiverId,
      receiverName,
      // Don't return the link in the response if you don't want it shown to the sender
    })

  } catch (error) {
    console.error("Error scheduling videocall:", error)
    return NextResponse.json({ error: "Failed to schedule videocall" }, { status: 500 })
  }
}
