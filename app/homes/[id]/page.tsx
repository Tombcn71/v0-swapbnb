import { getServerSession } from "next-auth/next"
import { notFound } from "next/navigation"
import { HomeDetailClient } from "@/components/homes/home-detail-client"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export default async function HomePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  try {
    const homes = await executeQuery(
      `SELECT h.*, u.name as host_name, u.profile_image as host_profile_image
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [params.id],
    )

    if (!homes || homes.length === 0) {
      return notFound()
    }

    const home = homes[0]

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
