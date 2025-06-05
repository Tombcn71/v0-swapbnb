import Image from "next/image"
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
      <Image
        src="/swapbnb-logo.png"
        alt="SwapBnB Logo"
        width={size === "sm" ? 20 : size === "md" ? 24 : 32}
        height={size === "sm" ? 20 : size === "md" ? 24 : 32}
        className={sizeClasses[size]}
      />
      {showText && <span className={` text-black ${textSizeClasses[size]}`}>SwapBnB</span>}
    </Link>
  )
}
