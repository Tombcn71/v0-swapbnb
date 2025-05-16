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
        h.images, 
        h.bedrooms, 
        h.bathrooms, 
        h.max_guests as "maxGuests", 
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

    // Process the home data to ensure it has the expected format
    const home = {
      ...rows[0],
      // If images is stored as a JSON string, parse it
      // If it's already an array, use it as is
      // If it's null/undefined, provide an empty array
      images: typeof rows[0].images === "string" ? JSON.parse(rows[0].images) : rows[0].images || [],
    }

    return NextResponse.json(home)
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
    const { title, description, address, bedrooms, bathrooms, maxGuests, images } = body

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
        images = ${JSON.stringify(images || [])},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING 
        id, 
        title, 
        description, 
        address, 
        images, 
        bedrooms, 
        bathrooms, 
        max_guests as "maxGuests", 
        user_id as "userId"
    `

    // Process the returned data
    const updatedHome = {
      ...rows[0],
      images: typeof rows[0].images === "string" ? JSON.parse(rows[0].images) : rows[0].images || [],
    }

    return NextResponse.json(updatedHome)
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
