import { notFound } from "next/navigation"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { SimplifiedExchangeDetail } from "@/components/exchanges/simplified-exchange-detail"

interface ExchangePageProps {
  params: {
    id: string
  }
}

export default async function ExchangePage({ params }: ExchangePageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return notFound()
  }

  try {
    // Get the exchange with all details
    const exchanges = await executeQuery(
      `SELECT e.*, 
              rh.title as requester_home_title, rh.city as requester_home_city, 
              rh.images as requester_home_images, rh.address as requester_home_address,
              hh.title as host_home_title, hh.city as host_home_city, 
              hh.images as host_home_images, hh.address as host_home_address,
              ru.name as requester_name, ru.email as requester_email, ru.profile_image as requester_profile_image,
              hu.name as host_name, hu.email as host_email, hu.profile_image as host_profile_image
       FROM exchanges e
       JOIN homes rh ON e.requester_home_id = rh.id
       JOIN homes hh ON e.host_home_id = hh.id
       JOIN users ru ON e.requester_id = ru.id
       JOIN users hu ON e.host_id = hu.id
       WHERE e.id = $1 AND (e.requester_id = $2 OR e.host_id = $2)`,
      [params.id, session.user.id],
    )

    if (exchanges.length === 0) {
      return notFound()
    }

    const exchange = exchanges[0]

    // Get all user's exchanges for the sidebar
    const allExchanges = await executeQuery(
      `SELECT e.id, e.status, e.created_at,
              CASE 
                WHEN e.requester_id = $1 THEN hu.name
                ELSE ru.name
              END as other_user_name,
              CASE 
                WHEN e.requester_id = $1 THEN hu.profile_image
                ELSE ru.profile_image
              END as other_user_image,
              CASE 
                WHEN e.requester_id = $1 THEN hh.city
                ELSE rh.city
              END as other_user_city
       FROM exchanges e
       JOIN homes rh ON e.requester_home_id = rh.id
       JOIN homes hh ON e.host_home_id = hh.id
       JOIN users ru ON e.requester_id = ru.id
       JOIN users hu ON e.host_id = hu.id
       WHERE e.requester_id = $1 OR e.host_id = $1
       ORDER BY e.updated_at DESC`,
      [session.user.id],
    )

    return (
      <div className="min-h-screen bg-gray-50">
        <SimplifiedExchangeDetail exchange={exchange} allExchanges={allExchanges} currentUserId={session.user.id} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching exchange:", error)
    return notFound()
  }
}
