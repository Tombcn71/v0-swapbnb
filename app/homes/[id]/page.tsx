import { getServerSession } from "next-auth/next"
import { notFound } from "next/navigation"
import { HomeDetailClient } from "@/components/homes/home-detail-client"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export default async function HomePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  try {
    // Log the params ID for debugging
    console.log("HomePage - params.id:", params.id)

    // Use the sql template literal directly
    const { rows: homes } = await sql`
      SELECT h.*, u.name as host_name
      FROM homes h
      JOIN users u ON h.user_id = u.id
      WHERE h.id = ${params.id}
    `

    if (!homes || homes.length === 0) {
      console.log("No home found with ID:", params.id)
      return notFound()
    }

    const home = homes[0]

    // Log the raw home data for debugging
    console.log("Raw home data:", JSON.stringify(home, null, 2))
    console.log("Home ID from database:", home.id)

    // Process the home data to ensure it has the expected format
    const processedHome = {
      ...home,
      // Ensure ID is explicitly included and converted to string
      id: home.id ? home.id.toString() : params.id,
      // Parse the images JSON if it's a string
      images: typeof home.images === "string" ? JSON.parse(home.images) : home.images || [],
      // Parse the amenities JSON if it's a string
      amenities: typeof home.amenities === "string" ? JSON.parse(home.amenities) : home.amenities || {},
    }

    // Check if the current user is the owner
    const isOwner = userId === home.user_id

    // Log the processed home data for debugging
    console.log("Processed home ID:", processedHome.id)

    return <HomeDetailClient home={processedHome} userId={userId} isOwner={isOwner} />
  } catch (error) {
    console.error("Error fetching home:", error)
    return notFound()
  }
}
