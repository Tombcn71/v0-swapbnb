"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"

interface ExchangeReviewProps {
  exchangeId: string
  homeId: string
}

export function ExchangeReview({ exchangeId, homeId }: ExchangeReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Beoordeling vereist",
        description: "Selecteer een aantal sterren voor je beoordeling",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Opmerking vereist",
        description: "Voer een opmerking in voor je beoordeling",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exchangeId,
          homeId,
          rating,
          comment,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit review")
      }

      toast({
        title: "Beoordeling geplaatst",
        description: "Je beoordeling is succesvol geplaatst.",
      })

      setHasReviewed(true)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Er is iets misgegaan",
        description: error.message || "Kon de beoordeling niet plaatsen. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasReviewed) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-8 w-8 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
            />
          ))}
        </div>
        <h3 className="text-xl font-semibold mb-2">Bedankt voor je beoordeling!</h3>
        <p className="text-gray-600">Je feedback helpt andere gebruikers bij het maken van hun keuze.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Schrijf een beoordeling</h3>
        <p className="text-gray-600 mb-4">
          Deel je ervaring met deze woning en help andere gebruikers bij het maken van hun keuze.
        </p>

        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                className={`h-10 w-10 ${
                  star <= (hoverRating || rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Je beoordeling
          </label>
          <Textarea
            id="comment"
            placeholder="Deel je ervaring met deze woning..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Beoordeling plaatsen..." : "Plaats beoordeling"}
        </Button>
      </div>
    </form>
  )
}
