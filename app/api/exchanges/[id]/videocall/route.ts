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

    const { scheduled_at, videocall_link } = await request.json()
    const exchangeId = params.id

    // Controleer toegang
    const exchange = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, session.user.id],
    )

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    // Genereer Jitsi Meet link als er geen is meegegeven
    const jitsiLink = videocall_link || `https://meet.jit.si/swapbnb-${exchangeId.substring(0, 8)}`

    // Update exchange met videocall informatie
    await executeQuery(
      `UPDATE exchanges 
       SET videocall_scheduled_at = $1, 
           videocall_link = $2,
           updated_at = NOW() 
       WHERE id = $3`,
      [scheduled_at, jitsiLink, exchangeId],
    )

    return NextResponse.json({
      success: true,
      scheduledAt: scheduled_at,
      meetingLink: jitsiLink,
    })
  } catch (error) {
    console.error("Error scheduling videocall:", error)
    return NextResponse.json({ error: "Failed to schedule videocall" }, { status: 500 })
  }
}
