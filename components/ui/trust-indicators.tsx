"use client"
import { Shield, Users, Lock } from "lucide-react"

export function TrustIndicators() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">🛡️ Jouw veiligheid staat voorop</h3>
        <p className="text-gray-600">Alle leden worden geverifieerd voor een veilige ruil ervaring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">ID-Verificatie</h4>
          <p className="text-sm text-gray-600">Alle leden verifiëren hun identiteit via Stripe Identity</p>
        </div>

        <div className="text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Beoordelingen</h4>
          <p className="text-sm text-gray-600">Lees reviews van andere leden over hun ervaring</p>
        </div>

        <div className="text-center">
          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Veilige Betaling</h4>
          <p className="text-sm text-gray-600">Betalingen worden veilig verwerkt door Stripe</p>
        </div>
      </div>
    </div>
  )
}
