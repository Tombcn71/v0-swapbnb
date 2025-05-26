import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { HomeDetailClient } from "@/components/homes/home-detail-client"
import { SwapRequestForm } from "@/components/exchanges/swap-request-form"

async function getHome(id: string) {
  try {
    const homes = await executeQuery(
      `SELECT h.*, u.name as owner_name, u.profile_image as owner_profile_image
       FROM homes h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = $1`,
      [id],
    )

    if (homes.length === 0) {
      return null
    }

    const home = homes[0]

    // Parse images if they're stored as JSON string
    if (typeof home.images === "string") {
      try {
        home.images = JSON.parse(home.images)
      } catch {
        home.images = []
      }
    }

    // Parse amenities if they're stored as JSON string
    if (typeof home.amenities === "string") {
      try {
        home.amenities = JSON.parse(home.amenities)
      } catch {
        home.amenities = {}
      }
    }

    return home
  } catch (error) {
    console.error("Error fetching home:", error)
    return null
  }
}

async function getUserHomes(userId: string) {
  try {
    const homes = await executeQuery("SELECT id, title, city, images FROM homes WHERE user_id = $1", [userId])
    return homes
  } catch (error) {
    console.error("Error fetching user homes:", error)
    return []
  }
}

export default async function HomePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const home = await getHome(params.id)

  if (!home) {
    notFound()
  }

  const isOwner = session?.user?.id === home.user_id
  const userHomes = session?.user?.id ? await getUserHomes(session.user.id) : []

  // Update de return statement om alleen de HomeDetailClient te tonen:
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <HomeDetailClient home={home} userId={session?.user?.id} isOwner={isOwner} />
        </div>

        {/* Sidebar - Swap Request Form */}
        <div className="lg:col-span-1">{!isOwner && <SwapRequestForm targetHome={home} userHomes={userHomes} />}</div>
      </div>
    </div>
  )
}
