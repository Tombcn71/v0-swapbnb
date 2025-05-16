import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { rows } = await sql`
      SELECT 
        h.id, 
        h.title, 
        h.description, 
        h.address, 
        h.image_url as "imageUrl", 
        h.bedrooms, 
        h.bathrooms, 
        h.max_guests as "maxGuests", 
        h.price_per_night as "pricePerNight", 
        h.user_id as "userId",
        u.name as "ownerName",
        u.email as "ownerEmail"
      FROM homes h
      JOIN users u ON h.user_id = u.id
      WHERE h.id = ${params.id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching home:", error)
    return NextResponse.json({ error: "Failed to fetch home" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the home exists and belongs to the user
    const { rows: homeRows } = await sql`
      SELECT user_id FROM homes WHERE id = ${params.id}
    `

    if (homeRows.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    if (homeRows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "You do not have permission to update this home" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, address, bedrooms, bathrooms, maxGuests, pricePerNight, imageUrl } = body

    // Update the home
    const { rows } = await sql`
      UPDATE homes
      SET 
        title = ${title},
        description = ${description},
        address = ${address},
        bedrooms = ${bedrooms},
        bathrooms = ${bathrooms},
        max_guests = ${maxGuests},
        price_per_night = ${pricePerNight},
        image_url = ${imageUrl},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING 
        id, 
        title, 
        description, 
        address, 
        image_url as "imageUrl", 
        bedrooms, 
        bathrooms, 
        max_guests as "maxGuests", 
        price_per_night as "pricePerNight", 
        user_id as "userId"
    `

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error updating home:", error)
    return NextResponse.json({ error: "Failed to update home" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the home exists and belongs to the user
    const { rows: homeRows } = await sql`
      SELECT user_id FROM homes WHERE id = ${params.id}
    `

    if (homeRows.length === 0) {
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    if (homeRows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "You do not have permission to delete this home" }, { status: 403 })
    }

    // Delete all availabilities for this home
    await sql`
      DELETE FROM availabilities WHERE home_id = ${params.id}
    `

    // Delete the home
    await sql`
      DELETE FROM homes WHERE id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting home:", error)
    return NextResponse.json({ error: "Failed to delete home" }, { status: 500 })
  }
}
