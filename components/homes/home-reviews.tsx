"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: string
  reviewer_id: string
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

interface HomeReviewsProps {
  homeId: string
  rating: number
  reviewCount: number
}

export function HomeReviews({ homeId, rating, reviewCount }: HomeReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/reviews?homeId=${homeId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch reviews")
        }

        const data = await response.json()
        setReviews(data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        toast({
          title: "Er is iets misgegaan",
          description: "Kon de beoordelingen niet laden. Probeer het later opnieuw.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [homeId, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-t-teal-500 border-r-transparent border-b-teal-500 border-l-transparent rounded-full"></div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Deze woning heeft nog geen beoordelingen.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${star <= Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="ml-2 font-medium">{rating}</span>
        <span className="mx-1">·</span>
        <span>{reviewCount} beoordelingen</span>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="flex items-center mb-3">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={`/abstract-geometric-shapes.png?height=40&width=40&query=${review.reviewer_name}`}
                  alt={review.reviewer_name}
                />
                <AvatarFallback>{review.reviewer_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{review.reviewer_name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString("nl-NL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
