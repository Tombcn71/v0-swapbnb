"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"
import { useEffect } from "react"

interface CreditsPurchaseProps {
  currentCredits: number
  userEmail: string
}

// TypeScript declaration voor Stripe Pricing Table
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Coins className="h-5 w-5 text-amber-600" />
          <span>Credits Kopen</span>
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p>
            Huidige credits: <span className="font-semibold text-amber-600">{currentCredits}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="font-medium mb-2">Hoe werken credits?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Elke bevestigde swap kost 1 credit per persoon</li>
            <li>• Je krijgt 1 gratis credit bij je eerste woning upload</li>
            <li>• Credits verlopen niet</li>
            <li>• Gebruik coupon codes voor kortingen</li>
          </ul>
        </div>

        {/* Stripe Pricing Table - jouw exacte implementatie */}
        <div className="border rounded-lg bg-white">
          <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
          <stripe-pricing-table
            pricing-table-id="prctbl_1RVV7mBVKGepSVqCq57wgdx4"
            publishable-key="pk_live_51RVTwPBVKGepSVqCFdtmBQhIbOjvDvAhmWm0H3yc9Pq0KgA5FOA1Nj2FsDEZIMIFg0VYxe3OBJR3Lyot7Rz7NZdV00e39xcCnJ"
            customer-email={userEmail}
            client-reference-id={`credits-${userEmail}`}
          ></stripe-pricing-table>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            Betalingen worden veilig verwerkt door Stripe. Je ontvangt een bevestiging per e-mail en je credits worden
            automatisch toegevoegd.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
