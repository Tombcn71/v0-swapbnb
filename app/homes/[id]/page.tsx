import { getServerSession } from "next-auth/next"
import { notFound } from "next/navigation"
import { HomeDetailClient } from "@/components/homes/home-detail-client"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export default async function HomePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  try {
    // Updated query to use 'images' instead of 'image_url'
    const home = await executeQuery(
      `SELECT h.*, u.name as host_name
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [params.id],
    )

    if (home.length === 0) {
      return notFound()
    }

    // Process the home data to ensure it has the expected format
    const processedHome = {
      ...home[0],
      // Parse the images JSON if it's a string
      images: typeof home[0].images === "string" ? JSON.parse(home[0].images) : home[0].images || [],
    }

    // Check if the current user is the owner
    const isOwner = userId === home[0].user_id

    return <HomeDetailClient home={processedHome} userId={userId} isOwner={isOwner} />
  } catch (error) {
    console.error("Error fetching home:", error)
    return notFound()
  }
}
