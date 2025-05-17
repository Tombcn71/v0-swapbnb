"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, CheckCircle } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangePaymentProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangePayment({ exchange, isRequester }: ExchangePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Bepaal de betalingsstatus op basis van de rol
  const paymentStatus = isRequester
    ? exchange.requesterPaymentStatus || "pending"
    : exchange.hostPaymentStatus || "pending"

  const isPaid = paymentStatus === "paid"

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/exchanges/${exchange.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process payment")
      }

      toast({
        title: "Betaling succesvol",
        description: "Je betaling is succesvol verwerkt.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Betaling mislukt",
        description: error.message || "Er is een fout opgetreden bij het verwerken van je betaling.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Swap-kosten</CardTitle>
        <CardDescription>Betaal de swap-kosten om de huizenswap te bevestigen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Swap-kosten</span>
            <span className="font-semibold">€{exchange.serviceFee || 25}.00</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Totaal</span>
              <span className="font-semibold">€{exchange.serviceFee || 25}.00</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isPaid ? (
          <div className="w-full flex items-center justify-center p-2 bg-green-50 border border-green-100 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">Betaling voltooid</span>
          </div>
        ) : (
          <Button
            onClick={handlePayment}
            disabled={isProcessing || exchange.status !== "accepted"}
            className="w-full bg-google-blue hover:bg-blue-600"
          >
            {isProcessing ? (
              "Betaling verwerken..."
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Betaal nu
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
