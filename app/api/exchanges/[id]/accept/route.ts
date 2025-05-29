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

    const exchangeId = params.id

    // Controleer of gebruiker de host is
    const exchange = await executeQuery("SELECT * FROM exchanges WHERE id = $1 AND host_id = $2", [
      exchangeId,
      session.user.id,
    ])

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Exchange not found or unauthorized" }, { status: 404 })
    }

    if (exchange[0].status !== "pending") {
      return NextResponse.json({ error: "Exchange is not pending" }, { status: 400 })
    }

    // Update status naar accepted
    await executeQuery(
      "UPDATE exchanges SET status = 'accepted', accepted_at = NOW(), updated_at = NOW() WHERE id = $1",
      [exchangeId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error accepting exchange:", error)
    return NextResponse.json({ error: "Failed to accept exchange" }, { status: 500 })
  }
}
