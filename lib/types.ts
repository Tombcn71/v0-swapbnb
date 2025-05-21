export interface User {
  id: string
  name: string
  email: string
  profile_image?: string
  created_at: string
  updated_at: string
}

export interface Home {
  id: string
  user_id: string
  title: string
  description: string
  address: string
  city: string
  postal_code: string
  bedrooms: number
  bathrooms: number
  max_guests: number
  amenities: Record<string, boolean>
  images: string[]
  created_at: string
  updated_at: string
  owner_name?: string
  owner_profile_image?: string
  isOwner?: boolean
}

export interface Exchange {
  id: string
  home_id: string
  guest_id: string
  start_date: string
  end_date: string
  guests: number
  message: string
  status: "pending" | "approved" | "rejected" | "completed"
  created_at: string
  updated_at: string
  guest_name?: string
  guest_profile_image?: string
  home_title?: string
  home_city?: string
  home_image?: string
  owner_id?: string
  owner_name?: string
  owner_profile_image?: string
}

export interface Message {
  id: string
  exchange_id: string
  sender_id: string
  content: string
  created_at: string
  updated_at: string
  sender_name?: string
  sender_profile_image?: string
}

export interface Review {
  id: string
  exchange_id: string
  reviewer_id: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
  reviewer_name?: string
  reviewer_profile_image?: string
  home_id?: string
  home_title?: string
}
