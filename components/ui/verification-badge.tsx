"use client"

import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VerificationBadgeProps {
  verificationStatus: "verified" | "pending" | "failed" | "not_started"
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function VerificationBadge({ verificationStatus, size = "md", showText = true }: VerificationBadgeProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"
  const textSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"

  const getBadgeContent = () => {
    switch (verificationStatus) {
      case "verified":
        return {
          icon: <Shield className={`${iconSize} text-green-600`} />,
          text: "Geverifieerd",
          className: "bg-green-100 text-green-800 border-green-200",
          tooltip: {
            title: "✓ Identiteit geverifieerd",
            description: "Via Stripe Identity verificatie",
          },
        }
      case "pending":
        return {
          icon: <Clock className={`${iconSize} text-yellow-600`} />,
          text: "Verificatie lopend",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          tooltip: {
            title: "⏳ Verificatie in behandeling",
            description: "Identiteitsverificatie wordt verwerkt",
          },
        }
      case "failed":
        return {
          icon: <AlertTriangle className={`${iconSize} text-red-600`} />,
          text: "Verificatie mislukt",
          className: "bg-red-100 text-red-800 border-red-200",
          tooltip: {
            title: "✗ Verificatie mislukt",
            description: "Probeer opnieuw te verifiëren",
          },
        }
      default:
        return {
          icon: <AlertTriangle className={`${iconSize} text-gray-600`} />,
          text: "Niet geverifieerd",
          className: "bg-gray-100 text-gray-800 border-gray-200",
          tooltip: {
            title: "⚠️ Niet geverifieerd",
            description: "Gebruiker heeft nog geen ID-verificatie voltooid",
          },
        }
    }
  }

  const badgeContent = getBadgeContent()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${badgeContent.className} gap-1`}>
            {badgeContent.icon}
            {showText && <span className={textSize}>{badgeContent.text}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{badgeContent.tooltip.title}</p>
            <p className="text-xs text-gray-600">{badgeContent.tooltip.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
