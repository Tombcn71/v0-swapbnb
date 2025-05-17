import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

// GET /api/favorites/check?homeId=xxx - Controleer of een woning favoriet is
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ isFavorite: false })
    }

    const homeId = request.nextUrl.searchParams.get("homeId")

    if (!homeId) {
      return NextResponse.json({ error: "Woning ID is vereist" }, { status: 400 })
    }

    const favorite = await executeQuery("SELECT id FROM favorites WHERE user_id = $1 AND home_id = $2", [
      session.user.id,
      homeId,
    ])

    return NextResponse.json({ isFavorite: favorite.length > 0 })
  } catch (error) {
    console.error("Error checking favorite status:", error)
    return NextResponse.json({ error: "Er is een fout opgetreden" }, { status: 500 })
  }
}
