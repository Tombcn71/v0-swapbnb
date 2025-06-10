import { notFound } from "next/navigation"
import { SimplifiedExchangeDetail } from "@/components/exchanges/simplified-exchange-detail"

async function getExchange(id: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/exchanges/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching exchange:", error)
    return null
  }
}

async function getAllExchanges() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/exchanges`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return []
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching all exchanges:", error)
    return []
  }
}

async function getCurrentUser() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const session = await response.json()
    return session?.user?.id || null
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export default async function ExchangeDetailPage({ params }: { params: { id: string } }) {
  const [exchange, allExchanges, currentUserId] = await Promise.all([
    getExchange(params.id),
    getAllExchanges(),
    getCurrentUser(),
  ])

  if (!exchange || !currentUserId) {
    notFound()
  }

  return (
    <div className="h-screen overflow-hidden">
      <SimplifiedExchangeDetail exchange={exchange} allExchanges={allExchanges} currentUserId={currentUserId} />
    </div>
  )
}
