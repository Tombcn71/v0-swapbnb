import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/homes/[id] - Fetch a specific home
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const homeId = params.id

    console.log(`Fetching home with ID: ${homeId}`)

    // Updated query to use 'images' instead of 'image_url'
    const home = await executeQuery(
      `SELECT h.*, u.name as host_name
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [homeId],
    )

    if (home.length === 0) {
      console.log(`Home with ID ${homeId} not found`)
      return NextResponse.json({ error: "Home not found" }, { status: 404 })
    }

    console.log(`Found home: ${home[0].title}`)

    // Fetch availabilities
    const availabilities = await executeQuery(
      "SELECT * FROM availabilities WHERE home_id = $1 ORDER BY start_date ASC",
      [homeId],
    )

    console.log(`Found ${availabilities.length} availabilities`)

    // Fetch reviews
    const reviews = await executeQuery(
      `SELECT r.*, u.name as reviewer_name
       FROM reviews r
       JOIN users u ON r.author_id = u.id
       WHERE r.home_id = $1
       ORDER BY r.created_at DESC`,
      [homeId],
    )

    console.log(`Found ${reviews.length} reviews`)

    // Process the home data to ensure it has the expected format
    const processedHome = {
      ...home[0],
      // Parse the images JSON if it's a string
      images: typeof home[0].images === "string" ? JSON.parse(home[0].images) : home[0].images || [],
      availabilities,
      reviews,
    }

    return NextResponse.json(processedHome)
  } catch (error) {
    console.error("Error fetching home:", error)
    return NextResponse.json({ error: "Failed to fetch home" }, { status: 500 })
  }
}

// PATCH /api/homes/[id] - Update a home
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const homeId = params.id
    const userId = session.user.id

    // Check if the user is the owner of the home
    const homes = await executeQuery("SELECT * FROM homes WHERE id = $1 AND user_id = $2", [homeId, userId])

    if (homes.length === 0) {
      return NextResponse.json({ error: "Home not found or you are not the owner" }, { status: 403 })
    }

    const { title, description, address, city, postalCode, bedrooms, bathrooms, maxGuests, amenities, images } =
      await request.json()

    // Validate input
    if (!title || !description || !address || !city || !postalCode || !bedrooms || !bathrooms || !maxGuests) {
      return NextResponse.json({ error: "All fields are required except amenities and images" }, { status: 400 })
    }

    // Update the home - using 'images' instead of 'image_url'
    const result = await executeQuery(
      `UPDATE homes 
       SET title = $1, description = $2, address = $3, city = $4, postal_code = $5, 
           bedrooms = $6, bathrooms = $7, max_guests = $8, amenities = $9, images = $10, 
           updated_at = NOW()
       WHERE id = $11 AND user_id = $12
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
        userId,
      ],
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "Failed to update home" }, { status: 500 })
    }

    // Fetch the updated home data
    const updatedHome = await executeQuery(
      `SELECT h.*, u.name as host_name
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [homeId],
    )

    // Process the home data
    const processedHome = {
      ...updatedHome[0],
      images:
        typeof updatedHome[0].images === "string" ? JSON.parse(updatedHome[0].images) : updatedHome[0].images || [],
    }

    return NextResponse.json(processedHome)
  } catch (error) {
    console.error("Error updating home:", error)
    return NextResponse.json({ error: "Failed to update home" }, { status: 500 })
  }
}

// DELETE /api/homes/[id] - Delete a home
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const homeId = params.id
    const userId = session.user.id

    // Check if the user is the owner of the home
    const homes = await executeQuery("SELECT * FROM homes WHERE id = $1 AND user_id = $2", [homeId, userId])

    if (homes.length === 0) {
      return NextResponse.json({ error: "Home not found or you are not the owner" }, { status: 403 })
    }

    // Delete availabilities first
    await executeQuery("DELETE FROM availabilities WHERE home_id = $1", [homeId])

    // Delete the home
    await executeQuery("DELETE FROM homes WHERE id = $1 AND user_id = $2", [homeId, userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting home:", error)
    return NextResponse.json({ error: "Failed to delete home" }, { status: 500 })
  }
}
