import { getServerSession } from "next-auth/next"
import { notFound } from "next/navigation"
import { HomeDetailClient } from "@/components/homes/home-detail-client"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export default async function HomePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  try {
    // Log voor debugging
    console.log("HomePage - Fetching home with ID:", params.id)

    const homes = await executeQuery(
      `SELECT h.*, u.name as owner_name, u.profile_image as owner_profile_image
      FROM homes h
      JOIN users u ON h.user_id = u.id
      WHERE h.id = $1`,
      [params.id],
    )

    // Log voor debugging
    console.log("HomePage - Query result:", homes)

    if (!homes || homes.length === 0) {
      return notFound()
    }

    const home = homes[0]

    // Log voor debugging
    console.log("HomePage - owner_profile_image:", home.owner_profile_image)

    // Process the home data to ensure it has the expected format
    const processedHome = {
      ...home,
      images: typeof home.images === "string" ? JSON.parse(home.images) : home.images || [],
      amenities: typeof home.amenities === "string" ? JSON.parse(home.amenities) : home.amenities || {},
    }

    // Check if the current user is the owner
    const isOwner = userId === home.user_id

    return <HomeDetailClient home={processedHome} userId={userId} isOwner={isOwner} />
  } catch (error) {
    console.error("Error fetching home:", error)
    return notFound()
  }
}
