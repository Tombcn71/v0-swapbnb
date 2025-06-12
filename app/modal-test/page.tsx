"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditModal } from "@/components/credit-modal"

export default function ModalTestPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Modal Test Page</h1>
      <Button onClick={() => setShowModal(true)}>Toon Modal</Button>
      <CreditModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
