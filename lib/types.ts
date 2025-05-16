export type ExchangeStatus = "pending" | "confirmed" | "rejected" | "canceled" | "completed"

export interface Exchange {
  id: string
  requesterId: string
  requesterName: string
  hostId: string
  hostName: string
  requesterHomeId: string
  requesterHomeTitle: string
  hostHomeId: string
  hostHomeTitle: string
  hostHomeCity: string
  startDate: string
  endDate: string
  status: ExchangeStatus
  createdAt: string
  updatedAt: string
  message?: string
  serviceFee?: number
  paymentStatus?: string
}

export interface User {
  id: string
  name: string
  email: string
  image?: string
}

export interface Home {
  id: string
  title: string
  description: string
  address: string
  city: string
  postal_code?: string
  postalCode?: string
  images: string[] | string
  bedrooms: number
  bathrooms: number
  max_guests?: number
  maxGuests?: number
  amenities: any
  user_id?: string
  userId?: string
  host_name?: string
  hostName?: string
  rating?: number
  reviewCount?: number
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
}

export interface Availability {
  id: string
  homeId: string
  startDate: string
  endDate: string
}

export interface Review {
  id: string
  exchangeId: string
  reviewerId: string
  reviewerName: string
  homeId: string
  rating: number
  comment: string
  createdAt: string
}
