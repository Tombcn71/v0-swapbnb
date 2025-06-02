import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Haal alle huizen van de gebruiker op - gebruik city in plaats van location
    const homes = await executeQuery(
      `
      SELECT 
        id,
        title,
        description,
        city,
        address,
        postal_code,
        bedrooms,
        bathrooms,
        max_guests,
        amenities,
        images,
        created_at,
        updated_at
      FROM homes 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `,
      [userId],
    )

    return NextResponse.json(homes)
  } catch (error) {
    console.error("Error fetching user homes:", error)
    return NextResponse.json({ error: "Failed to fetch homes" }, { status: 500 })
  }
}
