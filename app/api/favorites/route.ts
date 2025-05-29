import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

// GET /api/favorites - Haal favorieten op voor de ingelogde gebruiker
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const favorites = await executeQuery(
      `SELECT f.id, f.home_id, h.title, h.city, h.images, h.bedrooms, h.bathrooms 
       FROM favorites f
       JOIN homes h ON f.home_id = h.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [session.user.id],
    )

    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Er is een fout opgetreden bij het ophalen van favorieten" }, { status: 500 })
  }
}

// POST /api/favorites - Voeg een woning toe aan favorieten
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const { homeId } = await request.json()

    if (!homeId) {
      return NextResponse.json({ error: "Woning ID is vereist" }, { status: 400 })
    }

    // Controleer of de woning al in favorieten staat
    const existingFavorite = await executeQuery("SELECT id FROM favorites WHERE user_id = $1 AND home_id = $2", [
      session.user.id,
      homeId,
    ])

    if (existingFavorite.length > 0) {
      // Woning is al favoriet, verwijder het
      await executeQuery("DELETE FROM favorites WHERE user_id = $1 AND home_id = $2", [session.user.id, homeId])
      return NextResponse.json({ isFavorite: false, message: "Woning verwijderd uit favorieten" })
    } else {
      // Woning is nog niet favoriet, voeg toe
      await executeQuery("INSERT INTO favorites (user_id, home_id) VALUES ($1, $2)", [session.user.id, homeId])
      return NextResponse.json({ isFavorite: true, message: "Woning toegevoegd aan favorieten" })
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json({ error: "Er is een fout opgetreden bij het bijwerken van favorieten" }, { status: 500 })
  }
}
