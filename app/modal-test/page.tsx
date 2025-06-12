"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function ModalTestPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Modal Test Pagina</h1>

      <Button onClick={() => setShowModal(true)} className="mb-4">
        Toon Modal
      </Button>

      <p>Deze pagina test of modals werken in de applicatie. Klik op de knop hierboven om een modal te tonen.</p>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Test Modal</h2>
            <p className="mb-4">Dit is een test modal. Als je dit ziet, werken modals correct in de applicatie.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Sluiten
              </Button>
              <Button onClick={() => (window.location.href = "/")}>Naar Home</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
