import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Controleer of gebruiker toegang heeft tot deze exchange
    const exchanges = await executeQuery(
      `SELECT id FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)`,
      [params.id, session.user.id],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    // Haal berichten op (voor nu simuleren we wat berichten)
    const messages = [
      {
        id: "1",
        sender_id: session.user.id,
        sender_name: session.user.name,
        content: "Hallo! Ik ben geïnteresseerd in jullie huis.",
        message_type: "text",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ]

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, message_type } = await request.json()

    // Controleer toegang
    const exchanges = await executeQuery(
      `SELECT id FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)`,
      [params.id, session.user.id],
    )

    if (exchanges.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    // Voor nu gewoon success returnen
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
