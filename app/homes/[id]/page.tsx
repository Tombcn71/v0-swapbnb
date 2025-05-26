import { notFound } from "next/navigation"
import { executeQuery } from "@/lib/db"
import { HomeDetailClient } from "@/components/homes/home-detail-client"
import type { Home, Review, Availability } from "@/lib/types"

interface HomePageProps {
  params: {
    id: string
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const homeId = Number.parseInt(params.id)

  if (isNaN(homeId)) {
    notFound()
  }

  try {
    // Haal de woning op met eigenaar informatie
    const homes = await executeQuery(
      `SELECT h.*, u.name as owner_name, u.email as owner_email, u.image as owner_image
       FROM homes h 
       JOIN users u ON h.user_id = u.id 
       WHERE h.id = $1`,
      [homeId],
    )

    if (homes.length === 0) {
      notFound()
    }

    const home = homes[0] as Home & { owner_name: string; owner_email: string; owner_image: string | null }

    // Haal reviews op
    const reviews = await executeQuery(
      `SELECT r.*, u.name as reviewer_name, u.image as reviewer_image
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.home_id = $1
       ORDER BY r.created_at DESC`,
      [homeId],
    )

    // Haal beschikbaarheid op
    const availabilities = await executeQuery(
      `SELECT * FROM availabilities 
       WHERE home_id = $1 
       AND end_date >= CURRENT_DATE
       ORDER BY start_date ASC`,
      [homeId],
    )

    return (
      <HomeDetailClient
        home={home}
        owner={{
          id: home.user_id,
          name: home.owner_name,
          email: home.owner_email,
          image: home.owner_image,
        }}
        reviews={reviews as Review[]}
        availabilities={availabilities as Availability[]}
      />
    )
  } catch (error) {
    console.error("Error fetching home:", error)
    notFound()
  }
}
