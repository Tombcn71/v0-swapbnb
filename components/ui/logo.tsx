import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-5 w-5",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link href="/" className="flex items-center space-x-1">
      <div className="flex items-end ">
        <Image
          src="/swapbnb-logo.png"
          alt="SwapBnB Logo"
          width={size === "sm" ? 20 : size === "md" ? 24 : 32}
          height={size === "sm" ? 20 : size === "md" ? 24 : 32}
          className={sizeClasses[size]}
        />
      </div>
      {showText && (
        <span className={` ${textSizeClasses[size]}`}>
          <span className="text-black">swap</span>
          <span className="text-teal-500">bnb</span>
        </span>
      )}
    </Link>
  )
}
