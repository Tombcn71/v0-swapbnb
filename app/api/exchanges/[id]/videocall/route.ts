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

    // Controleer toegang
    const exchange = await executeQuery(
      "SELECT * FROM exchanges WHERE id = $1 AND (requester_id = $2 OR host_id = $2)",
      [exchangeId, session.user.id],
    )

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    if (exchange[0].status !== "accepted") {
      return NextResponse.json({ error: "Exchange must be accepted first" }, { status: 400 })
    }

    // Plan videocall (24 uur vanaf nu)
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const meetingLink = `https://meet.google.com/new` // Simpele link voor demo

    await executeQuery(
      `UPDATE exchanges 
       SET status = 'videocall_scheduled', 
           videocall_scheduled_at = $1, 
           videocall_link = $2,
           updated_at = NOW() 
       WHERE id = $3`,
      [scheduledAt, meetingLink, exchangeId],
    )

    return NextResponse.json({ success: true, scheduledAt, meetingLink })
  } catch (error) {
    console.error("Error scheduling videocall:", error)
    return NextResponse.json({ error: "Failed to schedule videocall" }, { status: 500 })
  }
}
