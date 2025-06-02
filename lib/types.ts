export interface User {
  id: string
  name: string
  email: string
  bio?: string
  profile_image?: string
  identity_verification_status?: "pending" | "verified" | "failed" | "not_started"
  onboarding_completed?: boolean
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
  owner_bio?: string
  owner_verified?: boolean
  isOwner?: boolean
}

export interface Exchange {
  id: string
  requester_id: string
  host_id: string
  requester_home_id: string
  host_home_id: string
  start_date: string
  end_date: string
  guests: number
  message?: string
  status:
    | "pending"
    | "accepted"
    | "videocall_scheduled"
    | "videocall_completed"
    | "payment_pending"
    | "completed"
    | "rejected"
    | "cancelled"

  // Videocall informatie
  videocall_scheduled_at?: string
  videocall_link?: string
  videocall_completed_at?: string

  // Betaling statussen (vereenvoudigd)
  requester_payment_status: "pending" | "paid" | "failed"
  host_payment_status: "pending" | "paid" | "failed"

  // ID verificatie statussen
  requester_identity_verification_status: "pending" | "verified" | "failed"
  host_identity_verification_status: "pending" | "verified" | "failed"

  // Stripe session IDs
  requester_identity_session_id?: string
  host_identity_session_id?: string
  requester_payment_session_id?: string
  host_payment_session_id?: string

  // Timestamps
  created_at: string
  updated_at: string
  accepted_at?: string
  completed_at?: string

  // Uitgebreide informatie (optioneel, voor joins)
  requester_home_title?: string
  requester_home_city?: string
  requester_home_images?: string | string[]
  host_home_title?: string
  host_home_city?: string
  host_home_images?: string | string[]
  requester_name?: string
  requester_email?: string
  host_name?: string
  host_email?: string
}

export interface Message {
  id: string
  exchange_id: string
  sender_id: string
  content: string
  message_type?: "text" | "videocall_invitation" | "videocall_scheduled"
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
