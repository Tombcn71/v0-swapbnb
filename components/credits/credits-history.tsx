"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Plus, Minus } from "lucide-react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

interface Transaction {
  id: string
  amount: number
  transaction_type: string
  description: string
  created_at: string
  stripe_session_id?: string
  exchange_id?: string
}

export function CreditsHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/credits")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <Plus className="h-4 w-4 text-green-600" />
    } else {
      return <Minus className="h-4 w-4 text-red-600" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge className="bg-green-100 text-green-800">Aankoop</Badge>
      case "free_home_upload":
        return <Badge className="bg-blue-100 text-blue-800">Gratis</Badge>
      case "swap_payment":
        return <Badge className="bg-orange-100 text-orange-800">Swap</Badge>
      case "refund":
        return <Badge className="bg-purple-100 text-purple-800">Terugbetaling</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Transactie Geschiedenis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Laden...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Transactie Geschiedenis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nog geen transacties</div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.created_at), "d MMM yyyy, HH:mm", { locale: nl })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTransactionBadge(transaction.transaction_type)}
                  <span className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
