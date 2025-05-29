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

// GET /api/messages/check-history - Controleer of er een chatgeschiedenis is
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const recipientId = url.searchParams.get("recipientId")

    if (!recipientId) {
      return NextResponse.json({ error: "Recipient ID is required" }, { status: 400 })
    }

    // Controleer of de IDs geldige UUIDs zijn
    if (!isValidUUID(recipientId) || !isValidUUID(session.user.id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // Controleer of er berichten zijn uitgewisseld tussen de gebruikers
    const messages = await executeQuery(
      `SELECT COUNT(*) as count
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
      [session.user.id, recipientId],
    )

    const hasHistory = messages[0].count > 0

    return NextResponse.json({ hasHistory })
  } catch (error) {
    console.error("Error checking chat history:", error)
    return NextResponse.json({ error: "Failed to check chat history" }, { status: 500 })
  }
}
