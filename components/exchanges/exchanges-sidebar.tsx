import type React from "react"

interface Exchange {
  id: string
  name: string
  // Add other properties as needed
}

interface ExchangesSidebarProps {
  exchanges?: Exchange[]
}

const ExchangesSidebar: React.FC<ExchangesSidebarProps> = ({ exchanges }) => {
  const safeExchanges = exchanges || []

  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-2">Exchanges</h2>
      {(exchanges || []).length > 0 ? (
        (exchanges || []).map((exchange) => (
          <div key={exchange.id} className="mb-2 p-2 bg-white rounded shadow-sm">
            {exchange.name}
          </div>
        ))
      ) : (
        <div className="p-4 text-gray-500">Geen berichten</div>
      )}
    </div>
  )
}

export { ExchangesSidebar }
export default ExchangesSidebar
