import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/exchanges/[id]/messages - Haal berichten op voor een specifieke uitwisseling
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id

    // Controleer of de gebruiker toegang heeft tot deze uitwisseling
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found or you don't have access to it" }, { status: 404 })
    }

    // Haal berichten op
    const messages = await executeQuery(
      `SELECT m.*, u.name as sender_name, u.profile_image as sender_profile_image
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.exchange_id = $1
       ORDER BY m.created_at ASC`,
      [exchangeId],
    )

    // Markeer berichten als gelezen
    await executeQuery(
      `UPDATE messages 
       SET read_at = NOW() 
       WHERE exchange_id = $1 AND sender_id != $2 AND read_at IS NULL`,
      [exchangeId, userId],
    )

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST /api/exchanges/[id]/messages - Stuur een bericht voor een specifieke uitwisseling
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id
    const { content, is_quick_reply = false } = await request.json()

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Controleer of de gebruiker toegang heeft tot deze uitwisseling
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found or you don't have access to it" }, { status: 404 })
    }

    const exchange = exchanges[0]

    // Bepaal de ontvanger
    const receiverId = exchange.requester_id === userId ? exchange.host_id : exchange.requester_id

    // Voeg bericht toe
    const newMessages = await executeQuery(
      `INSERT INTO messages (exchange_id, sender_id, receiver_id, content, is_quick_reply)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, exchange_id, sender_id, receiver_id, content, is_quick_reply, created_at, updated_at`,
      [exchangeId, userId, receiverId, content, is_quick_reply],
    )

    if (newMessages.length === 0) {
      return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
    }

    // Haal gebruikersgegevens op voor het bericht
    const users = await executeQuery("SELECT id, name, profile_image FROM users WHERE id = $1", [userId])

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 500 })
    }

    const user = users[0]
    const newMessage = {
      ...newMessages[0],
      sender_name: user.name,
      sender_profile_image: user.profile_image,
    }

    // Update de exchange updated_at timestamp
    await executeQuery("UPDATE exchanges SET updated_at = NOW() WHERE id = $1", [exchangeId])

    // Als dit een quick reply is, update de quick_reply_used vlag
    if (is_quick_reply) {
      await executeQuery("UPDATE exchanges SET quick_reply_used = TRUE WHERE id = $1", [exchangeId])
    }

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
