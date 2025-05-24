import { Home } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="bg-blue-600 text-white p-1 rounded-md">
        <Home className={sizeClasses[size]} />
      </div>
      {showText && <span className={`font-bold text-blue-600 ${textSizeClasses[size]}`}>SwapBnB</span>}
    </Link>
  )
}
