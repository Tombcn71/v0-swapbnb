"use client"

import dynamic from "next/dynamic"

const PromoBanner = dynamic(() => import("@/components/promo-banner").then((mod) => mod.PromoBanner), {
  ssr: false,
})

export function BannerProvider() {
  return <PromoBanner />
}
