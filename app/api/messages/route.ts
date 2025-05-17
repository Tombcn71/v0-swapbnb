import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

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

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, content } = body

    // Valideer input
    if (!recipientId || !content) {
      return NextResponse.json({ error: "Recipient ID and content are required" }, { status: 400 })
    }

    // Controleer of de receiver ID een geldige UUID is
    if (!isValidUUID(recipientId)) {
      console.error("Invalid UUID format for recipient ID:", recipientId)
      return NextResponse.json({ error: "Invalid recipient ID format" }, { status: 400 })
    }

    // Controleer of de sessie gebruiker ID een geldige UUID is
    if (!isValidUUID(session.user.id)) {
      console.error("Invalid UUID format for session user ID:", session.user.id)
      return NextResponse.json({ error: "Invalid session user ID format" }, { status: 400 })
    }

    // Controleer of de ontvanger bestaat
    const receivers = await executeQuery("SELECT * FROM users WHERE id = $1", [recipientId])

    if (receivers.length === 0) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    // Stuur het bericht
    const result = await executeQuery(
      `INSERT INTO messages 
       (sender_id, receiver_id, content, read) 
       VALUES ($1, $2, $3, false) 
       RETURNING *`,
      [session.user.id, recipientId, content],
    )

    // Haal de volledige berichtgegevens op
    const messages = await executeQuery(
      `SELECT m.*, 
              sender.name as sender_name,
              receiver.name as receiver_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.id = $1`,
      [result[0].id],
    )

    return NextResponse.json(messages[0], { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
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
