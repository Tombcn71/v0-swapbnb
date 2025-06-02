"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"
import { ArrowUpCircle, ArrowDownCircle, Gift, CreditCard, RefreshCw } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  transaction_type: string
  description: string
  created_at: string
  exchange_id?: string
}

interface CreditsHistoryProps {
  transactions: Transaction[]
}

export function CreditsHistory({ transactions }: CreditsHistoryProps) {
  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      switch (type) {
        case "purchase":
          return <CreditCard className="h-4 w-4 text-green-600" />
        case "free_home_upload":
          return <Gift className="h-4 w-4 text-blue-600" />
        case "refund":
          return <RefreshCw className="h-4 w-4 text-green-600" />
        default:
          return <ArrowUpCircle className="h-4 w-4 text-green-600" />
      }
    } else {
      return <ArrowDownCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600"
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge variant="secondary">Aankoop</Badge>
      case "free_home_upload":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Gratis
          </Badge>
        )
      case "swap_payment":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Swap
          </Badge>
        )
      case "refund":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Terugbetaling
          </Badge>
        )
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactie Geschiedenis</CardTitle>
        <CardDescription>Overzicht van al je credits transacties</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nog geen transacties</p>
            <p className="text-sm mt-1">
              Je eerste transactie verschijnt hier zodra je een woning uploadt of credits koopt.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTransactionBadge(transaction.transaction_type)}
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(transaction.created_at), {
                          addSuffix: true,
                          locale: nl,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${getTransactionColor(transaction.amount)}`}>
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount} credits
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
