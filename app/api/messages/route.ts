import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Functie om te controleren of een string een geldige UUID is
const isValidUUID = (id: string) => {
  if (!id) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// GET /api/messages - Haal berichten op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    // Als er een specifieke gebruiker is opgegeven, haal dan de berichten op tussen de huidige gebruiker en die gebruiker
    if (userId) {
      // Controleer of de gebruiker ID een geldige UUID is
      if (!isValidUUID(userId)) {
        console.error("Invalid UUID format for user ID:", userId)
        return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
      }

      // Controleer of de sessie gebruiker ID een geldige UUID is
      if (!isValidUUID(session.user.id)) {
        console.error("Invalid UUID format for session user ID:", session.user.id)
        return NextResponse.json({ error: "Invalid session user ID format" }, { status: 400 })
      }

      const messages = await executeQuery(
        `SELECT m.*, 
                sender.name as sender_name, 
                receiver.name as receiver_name
         FROM messages m
         JOIN users sender ON m.sender_id = sender.id
         JOIN users receiver ON m.receiver_id = receiver.id
         WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1)
         ORDER BY m.created_at ASC`,
        [session.user.id, userId],
      )

      // Markeer alle ongelezen berichten van deze afzender als gelezen
      await executeQuery("UPDATE messages SET read = true WHERE sender_id = $1 AND receiver_id = $2 AND read = false", [
        userId,
        session.user.id,
      ])

      return NextResponse.json(messages)
    }

    // Anders, haal alle unieke gebruikers op waarmee de huidige gebruiker berichten heeft uitgewisseld
    // Controleer of de sessie gebruiker ID een geldige UUID is
    if (!isValidUUID(session.user.id)) {
      console.error("Invalid UUID format for session user ID:", session.user.id)
      return NextResponse.json({ error: "Invalid session user ID format" }, { status: 400 })
    }

    const conversations = await executeQuery(
      `SELECT DISTINCT
         CASE
           WHEN m.sender_id = $1 THEN m.receiver_id
           ELSE m.sender_id
         END as other_user_id,
         CASE
           WHEN m.sender_id = $1 THEN receiver.name
           ELSE sender.name
         END as other_user_name,
         (
           SELECT content
           FROM messages
           WHERE (sender_id = $1 AND receiver_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
              OR (sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AND receiver_id = $1)
           ORDER BY created_at DESC
           LIMIT 1
         ) as last_message_content,
         (
           SELECT created_at
           FROM messages
           WHERE (sender_id = $1 AND receiver_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
              OR (sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AND receiver_id = $1)
           ORDER BY created_at DESC
           LIMIT 1
         ) as last_message_time,
         (
           SELECT COUNT(*)
           FROM messages
           WHERE receiver_id = $1 
             AND sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
             AND read = false
         ) as unread_count
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY last_message_time DESC`,
      [session.user.id],
    )

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST /api/messages - Stuur een nieuw bericht
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recipientId, homeId, content, exchangeId } = await request.json()

    if (!recipientId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Voeg bericht toe aan database - gebruik alleen exchange_id als het een geldig exchange ID is
    // Voor gewone berichten (niet gekoppeld aan een exchange) laten we exchange_id NULL
    const result = await sql`
      INSERT INTO messages (sender_id, receiver_id, exchange_id, content)
      VALUES (${session.user.id}, ${recipientId}, ${exchangeId || null}, ${content})
      RETURNING id, created_at
    `

    return NextResponse.json({
      success: true,
      messageId: result[0].id,
      createdAt: result[0].created_at,
    })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/messages - Markeer berichten als gelezen
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { senderId } = await request.json()

    // Valideer input
    if (!senderId) {
      return NextResponse.json({ error: "Sender ID is required" }, { status: 400 })
    }

    // Controleer of de sender ID een geldige UUID is
    if (!isValidUUID(senderId)) {
      console.error("Invalid UUID format for sender ID:", senderId)
      return NextResponse.json({ error: "Invalid sender ID format" }, { status: 400 })
    }

    // Controleer of de sessie gebruiker ID een geldige UUID is
    if (!isValidUUID(session.user.id)) {
      console.error("Invalid UUID format for session user ID:", session.user.id)
      return NextResponse.json({ error: "Invalid session user ID format" }, { status: 400 })
    }

    // Markeer alle ongelezen berichten van deze afzender als gelezen
    await executeQuery("UPDATE messages SET read = true WHERE sender_id = $1 AND receiver_id = $2 AND read = false", [
      senderId,
      session.user.id,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 })
  }
}

// DELETE /api/messages - Verwijder een bericht
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const messageId = url.searchParams.get("id")

    // Valideer input
    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    // Controleer of de message ID een geldige UUID is
    if (!isValidUUID(messageId)) {
      console.error("Invalid UUID format for message ID:", messageId)
      return NextResponse.json({ error: "Invalid message ID format" }, { status: 400 })
    }

    // Controleer of de sessie gebruiker ID een geldige UUID is
    if (!isValidUUID(session.user.id)) {
      console.error("Invalid UUID format for session user ID:", session.user.id)
      return NextResponse.json({ error: "Invalid session user ID format" }, { status: 400 })
    }

    // Controleer of het bericht bestaat en of de gebruiker de afzender is
    const message = await executeQuery("SELECT * FROM messages WHERE id = $1 AND sender_id = $2", [
      messageId,
      session.user.id,
    ])

    if (message.length === 0) {
      return NextResponse.json({ error: "Message not found or you are not the sender" }, { status: 404 })
    }

    // Verwijder het bericht
    await executeQuery("DELETE FROM messages WHERE id = $1", [messageId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}
