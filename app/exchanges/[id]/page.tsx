import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { ExchangeDetail } from "@/components/exchanges/exchange-detail"

interface ExchangeDetailPageProps {
  params: {
    id: string
  }
}

export default async function ExchangeDetailPage({ params }: ExchangeDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/exchanges/" + params.id)
  }

  // Haal de uitwisseling op
  const exchanges = await executeQuery(
    `SELECT e.*, 
            rh.title as requester_home_title, rh.city as requester_home_city, rh.images as requester_home_images,
            hh.title as host_home_title, hh.city as host_home_city, hh.images as host_home_images,
            ru.name as requester_name, ru.email as requester_email,
            hu.name as host_name, hu.email as host_email
     FROM exchanges e
     JOIN homes rh ON e.requester_home_id = rh.id
     JOIN homes hh ON e.host_home_id = hh.id
     JOIN users ru ON e.requester_id = ru.id
     JOIN users hu ON e.host_id = hu.id
     WHERE e.id = $1 AND (e.requester_id = $2 OR e.host_id = $2)`,
    [params.id, session.user.id],
  )

  if (exchanges.length === 0) {
    redirect("/exchanges")
  }

  const exchange = exchanges[0]
  const isRequester = exchange.requester_id === session.user.id

  return (
    <div className="container mx-auto py-8">
      <ExchangeDetail exchange={exchange} isRequester={isRequester} />
    </div>
  )
}
