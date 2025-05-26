import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scheduled_at } = await request.json()

    // Update exchange status
    await executeQuery(
      `UPDATE exchanges 
       SET status = 'videocall_scheduled', videocall_scheduled_at = $2
       WHERE id = $1 AND (requester_id = $3 OR host_id = $3)`,
      [params.id, scheduled_at, session.user.id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error scheduling videocall:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
