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

    const { scheduled_at, type = "scheduled" } = await request.json()
    const exchangeId = params.id

    // Haal exchange details op
    const exchange = await executeQuery(
      `SELECT e.*, 
              r.name as requester_name, r.email as requester_email,
              h.name as host_name, h.email as host_email
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

    // Bepaal wie de ontvanger is
    const isRequester = exchangeData.requester_id === session.user.id
    const receiverId = isRequester ? exchangeData.host_id : exchangeData.requester_id
    const receiverName = isRequester ? exchangeData.host_name : exchangeData.requester_name

    // Maak Daily.co room aan met Prebuilt
    const roomName = `swapbnb-${exchangeId}-${Date.now()}`
    const dailyApiKey = process.env.DAILY_API_KEY

    let roomUrl = ""

    if (dailyApiKey) {
      try {
        // Maak room aan via Daily.co API (Prebuilt)
        const roomResponse = await fetch("https://api.daily.co/v1/rooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dailyApiKey}`,
          },
          body: JSON.stringify({
            name: roomName,
            properties: {
              max_participants: 2,
              enable_screenshare: true,
              enable_chat: true,
              start_video_off: false,
              start_audio_off: false,
              exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 uur geldig
              enable_prejoin_ui: true, // Prebuilt UI
              enable_network_ui: true,
              enable_people_ui: true,
            },
          }),
        })

        if (roomResponse.ok) {
          const roomData = await roomResponse.json()
          roomUrl = roomData.url
        } else {
          console.error("Failed to create Daily.co room:", await roomResponse.text())
          // Fallback naar publieke room
          roomUrl = `https://swapbnb.daily.co/${roomName}`
        }
      } catch (error) {
        console.error("Error creating Daily.co room:", error)
        // Fallback naar publieke room
        roomUrl = `https://swapbnb.daily.co/${roomName}`
      }
    } else {
      // Geen API key, gebruik publieke room
      roomUrl = `https://swapbnb.daily.co/${roomName}`
    }

    if (type === "scheduled") {
      // Update exchange met geplande videocall
      await executeQuery(
        `UPDATE exchanges 
         SET videocall_scheduled_at = $1, 
             videocall_link = $2,
             status = 'videocall_scheduled',
             updated_at = NOW() 
         WHERE id = $3`,
        [scheduled_at, roomUrl, exchangeId],
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
            text: `📹 ${session.user.name} heeft een videocall gepland voor ${scheduledDate}`,
            link: roomUrl,
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
        [roomUrl, exchangeId],
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
            text: `📞 ${session.user.name} wil nu videobellen!`,
            link: roomUrl,
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
      roomUrl,
      message: `Videocall ${type === "instant" ? "uitnodiging verstuurd" : "gepland"} naar ${receiverName}`,
    })
  } catch (error) {
    console.error("Error scheduling videocall:", error)
    return NextResponse.json({ error: "Failed to schedule videocall" }, { status: 500 })
  }
}
