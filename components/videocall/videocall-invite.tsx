"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Video, ExternalLink, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideocallInviteProps {
  content: string
}

export function VideocallInvite({ content }: VideocallInviteProps) {
  const { toast } = useToast()

  try {
    // Parse de JSON data
    const videocallData = JSON.parse(content)

    // Controleer of het een geldige videocall invite is
    if (videocallData && videocallData.type === "videocall_invite") {
      const handleJoinCall = () => {
        window.open(videocallData.link, "_blank", "noopener,noreferrer")
      }

      const handleCopyLink = async () => {
        try {
          await navigator.clipboard.writeText(videocallData.link)
          toast({
            title: "Link gekopieerd",
            description: "De videocall link is gekopieerd naar je klembord.",
          })
        } catch (err) {
          console.error("Failed to copy link:", err)
          toast({
            title: "Kopiëren mislukt",
            description: "Kon de link niet kopiëren.",
            variant: "destructive",
          })
        }
      }

      return (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Video className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-blue-900 font-medium mb-3">{videocallData.text}</p>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleJoinCall} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    {videocallData.linkText}
                  </Button>

                  <Button
                    onClick={handleJoinCall}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Nieuwe tab
                  </Button>

                  <Button onClick={handleCopyLink} variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                    <Copy className="h-4 w-4 mr-2" />
                    Kopieer link
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  } catch (e) {
    console.error("Error parsing videocall invite:", e)
    // Fallback voor als de parsing mislukt
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-3">
          <p className="text-red-700 text-sm">Fout bij laden videocall uitnodiging</p>
          <p className="text-red-500 text-xs mt-1">{content}</p>
        </CardContent>
      </Card>
    )
  }

  // Als er geen geldige data is, toon de originele content
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-3">
        <p className="text-gray-700">{content}</p>
      </CardContent>
    </Card>
  )
}
