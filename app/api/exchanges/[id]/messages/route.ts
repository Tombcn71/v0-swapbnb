import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exchangeId = params.id

    // Controleer of gebruiker toegang heeft tot deze exchange
    const exchange = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, session.user.id],
    )

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    // Haal berichten op
    const messages = await executeQuery(
      `SELECT m.*, u.name as sender_name 
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

    const { content } = await request.json()
    const exchangeId = params.id

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Controleer toegang
    const exchange = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, session.user.id],
    )

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    // Maak bericht aan (zonder updated_at kolom)
    const message = await executeQuery(
      `INSERT INTO messages (exchange_id, sender_id, content, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [exchangeId, session.user.id, content],
    )

    return NextResponse.json(message[0], { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
