import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { homeLogger } from "@/lib/logger"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const homeId = params.id
    homeLogger.info(`Ophalen van woning met ID: ${homeId}`)

    // Haal de woning op zonder eigenaar controle
    const home = await executeQuery(
      `SELECT h.*, u.name as owner_name, u.profile_image as owner_profile_image
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [homeId],
    )

    if (!home || home.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    // Voeg een vlag toe om aan te geven of de huidige gebruiker de eigenaar is
    // maar blokkeer de toegang NIET als ze niet de eigenaar zijn
    const session = await getServerSession(authOptions)
    const isOwner = session?.user?.id === home[0].user_id

    return NextResponse.json({ ...home[0], isOwner })
  } catch (error) {
    console.error("Error fetching home:", error)
    return NextResponse.json({ error: "Failed to fetch home" }, { status: 500 })
  }
}

// PUT /api/homes/[id] - Update een woning (alleen voor de eigenaar)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const homeId = params.id

    // Controleer of de gebruiker de eigenaar is
    const home = await executeQuery("SELECT * FROM homes WHERE id = $1", [homeId])

    if (!home || home.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    // Hier WEL controleren op eigenaarschap
    if (home[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized: You are not the owner of this home" }, { status: 403 })
    }

    const { title, description, address, city, postalCode, bedrooms, bathrooms, maxGuests, amenities, images } =
      await request.json()

    // Update de woning
    const result = await executeQuery(
      `UPDATE homes 
       SET title = $1, description = $2, address = $3, city = $4, postal_code = $5, 
           bedrooms = $6, bathrooms = $7, max_guests = $8, amenities = $9, images = $10,
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        title,
        description,
        address,
        city,
        postalCode,
        bedrooms,
        bathrooms,
        maxGuests,
        JSON.stringify(amenities || {}),
        JSON.stringify(images || []),
        homeId,
      ],
    )

    // Haal de bijgewerkte woning op met eigenaar details
    const updatedHome = await executeQuery(
      `SELECT h.*, u.name as owner_name, u.profile_image as owner_profile_image
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [homeId],
    )

    return NextResponse.json(updatedHome[0])
  } catch (error) {
    console.error("Error updating home:", error)
    return NextResponse.json({ error: "Failed to update home" }, { status: 500 })
  }
}

// DELETE /api/homes/[id] - Verwijder een woning (alleen voor de eigenaar)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const homeId = params.id

    // Controleer of de gebruiker de eigenaar is
    const home = await executeQuery("SELECT * FROM homes WHERE id = $1", [homeId])

    if (!home || home.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    // Hier WEL controleren op eigenaarschap
    if (home[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized: You are not the owner of this home" }, { status: 403 })
    }

    // Verwijder de woning
    await executeQuery("DELETE FROM homes WHERE id = $1", [homeId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting home:", error)
    return NextResponse.json({ error: "Failed to delete home" }, { status: 500 })
  }
}
