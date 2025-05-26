import type React from "react"
import type { Exchange } from "@/types/Exchange"
import ExchangeCard from "./exchange-card"

interface ExchangeListProps {
  exchanges: Exchange[]
}

const ExchangeList: React.FC<ExchangeListProps> = ({ exchanges }) => {
  const pendingExchanges = exchanges.filter((exchange) => exchange.status === "pending")
  const otherExchanges = exchanges.filter((exchange) => exchange.status !== "pending")

  return (
    <div>
      {pendingExchanges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-orange-600">⏳ Wacht op actie</h3>
          <div className="space-y-4">
            {pendingExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))}
          </div>
        </div>
      )}

      {otherExchanges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Alle exchanges</h3>
          <div className="space-y-4">
            {otherExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExchangeList
