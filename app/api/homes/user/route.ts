import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const homes = await executeQuery(
      `SELECT id, title, city, images 
       FROM homes 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId],
    )

    return NextResponse.json(homes)
  } catch (error) {
    console.error("Error fetching user homes:", error)
    return NextResponse.json({ error: "Failed to fetch homes" }, { status: 500 })
  }
}
