"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Shield, CheckCircle, Clock } from "lucide-react"
import type { Exchange } from "@/lib/types"

interface ExchangePaymentProps {
  exchange: Exchange
  isRequester: boolean
}

export function ExchangePayment({ exchange, isRequester }: ExchangePaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const userPaymentStatus = isRequester ? exchange.requester_payment_status : exchange.host_payment_status
  const userIdentityStatus = isRequester
    ? exchange.requester_identity_verification_status
    : exchange.host_identity_verification_status

  const otherPaymentStatus = isRequester ? exchange.host_payment_status : exchange.requester_payment_status
  const otherIdentityStatus = isRequester
    ? exchange.host_identity_verification_status
    : exchange.requester_identity_verification_status

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Voltooid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            In behandeling
          </Badge>
        )
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">✗ Mislukt</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Bereken voortgang
  const completedSteps = [userPaymentStatus, userIdentityStatus, otherPaymentStatus, otherIdentityStatus].filter(
    (status) => status === "paid" || status === "verified",
  ).length

  const progressPercentage = (completedSteps / 4) * 100

  // Alleen tonen als de exchange bevestigd is
  if (exchange.status !== "confirmed") {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Betaling & Verificatie Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Jouw status */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Jouw status</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Servicekosten (€50)</span>
              </div>
              {getStatusBadge(userPaymentStatus)}
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">ID-verificatie</span>
              </div>
              {getStatusBadge(userIdentityStatus)}
            </div>
          </div>
        </div>

        {/* Andere partij status */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium text-gray-900">Status andere partij</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Servicekosten</span>
              </div>
              {getStatusBadge(otherPaymentStatus)}
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">ID-verificatie</span>
              </div>
              {getStatusBadge(otherIdentityStatus)}
            </div>
          </div>
        </div>

        {/* Voortgang indicator */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Totale voortgang</span>
            <span className="font-medium text-blue-600">{completedSteps} / 4 voltooid</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p className="text-xs text-gray-600 mt-2">
            {progressPercentage === 100
              ? "🎉 Alle stappen voltooid! De swap is officieel bevestigd."
              : "Beide partijen moeten betalen en hun identiteit verifiëren."}
          </p>
        </div>

        {/* Informatie box */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-xs font-bold">i</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Belangrijk:</p>
              <ul className="space-y-1 text-xs">
                <li>• Servicekosten van €50 per persoon zijn verplicht</li>
                <li>• ID-verificatie is nodig voor veiligheid</li>
                <li>• De swap wordt pas officieel na alle stappen</li>
                <li>• Bij annulering kunnen kosten in rekening worden gebracht</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Volgende stap indicator */}
        {progressPercentage < 100 && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Volgende stap:</strong>{" "}
              {userPaymentStatus === "pending"
                ? "Betaal je servicekosten om door te gaan"
                : userIdentityStatus === "pending"
                  ? "Verifieer je identiteit"
                  : "Wacht tot de andere partij hun stappen voltooit"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
