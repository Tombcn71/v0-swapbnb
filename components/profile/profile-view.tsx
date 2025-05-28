"use client"

import Image from "next/image"
import { User, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProfileViewProps {
  user: {
    id: string
    name: string
    bio?: string
    profile_image?: string
    created_at: string
  }
  onClose?: () => void
}

export function ProfileView({ user, onClose }: ProfileViewProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profiel</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-200">
            {user.profile_image ? (
              <Image src={user.profile_image || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <div className="flex items-center justify-center text-gray-600 mt-2">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Lid sinds {new Date(user.created_at).getFullYear()}</span>
            </div>
          </div>
        </div>

        {user.bio && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Over {user.name}</h3>
            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
          </div>
        )}

        {!user.bio && (
          <div className="text-center text-gray-500 py-8">
            <p>Deze gebruiker heeft nog geen bio toegevoegd.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
