"use client"

import type React from "react"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"

// TypeScript declaration for Stripe Pricing Table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "pricing-table-id"?: string
        "publishable-key"?: string
        "customer-email"?: string
        "client-reference-id"?: string
      }
    }
  }
}

interface CreditsPurchaseProps {
  currentCredits: number
  userEmail: string
}

export function CreditsPurchase({ currentCredits, userEmail }: CreditsPurchaseProps) {
  useEffect(() => {
    // Load Stripe Pricing Table script
    const script = document.createElement("script")
    script.src = "https://js.stripe.com/v3/pricing-table.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Current Credits Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-amber-600" />
            <span>Jouw Credits</span>
          </CardTitle>
          <CardDescription>Credits worden gebruikt om swaps te bevestigen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600">{currentCredits} credits</div>
          <p className="text-sm text-gray-600 mt-2">Elke swap kost 1 credit per persoon</p>
        </CardContent>
      </Card>

      {/* Stripe Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credits Kopen</CardTitle>
          <CardDescription>
            Kies een pakket dat bij jou past. Coupon codes kunnen toegepast worden tijdens checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Replace with your actual Stripe Pricing Table ID and Publishable Key */}
          <stripe-pricing-table
            pricing-table-id="prctbl_1234567890" // Replace with your actual pricing table ID
            publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_..."} // Replace with your publishable key
            customer-email={userEmail}
            client-reference-id={`user_credits_purchase`}
          />

          {/* Fallback message while Stripe loads */}
          <div className="text-center py-8 text-gray-500">
            <p>Pricing table wordt geladen...</p>
            <p className="text-sm mt-2">Als dit lang duurt, controleer of JavaScript is ingeschakeld.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
