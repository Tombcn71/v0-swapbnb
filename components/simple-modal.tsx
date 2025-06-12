"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function SimpleModal() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Credits nodig</h2>
        <p className="mb-4">Je hebt niet genoeg credits om deze swap aan te vragen. Elke swap kost 1 credit.</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Sluiten
          </Button>
          <Button onClick={() => (window.location.href = "/credits")}>Credits kopen</Button>
        </div>
      </div>
    </div>
  )
}
