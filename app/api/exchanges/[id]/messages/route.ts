import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id

    // Controleer toegang
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    // Haal berichten op met gebruikersinfo
    const messages = await executeQuery(
      `SELECT m.*, u.name as sender_name, u.profile_image as sender_profile_image
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.exchange_id = $1
       ORDER BY m.created_at ASC`,
      [exchangeId],
    )

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id
    const userId = session.user.id
    const { content, is_quick_reply = false } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Controleer toegang
    const exchanges = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, userId],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    const exchange = exchanges[0]
    const receiverId = exchange.requester_id === userId ? exchange.host_id : exchange.requester_id

    // Voeg bericht toe
    const newMessages = await executeQuery(
      `INSERT INTO messages (exchange_id, sender_id, receiver_id, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [exchangeId, userId, receiverId, content],
    )

    // Haal gebruikersgegevens op
    const users = await executeQuery("SELECT id, name, profile_image FROM users WHERE id = $1", [userId])

    const newMessage = {
      ...newMessages[0],
      sender_name: users[0].name,
      sender_profile_image: users[0].profile_image,
      is_quick_reply: is_quick_reply, // Voeg dit toe aan response ook al staat het niet in DB
    }

    // Update exchange timestamp
    await executeQuery("UPDATE exchanges SET updated_at = NOW() WHERE id = $1", [exchangeId])

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
