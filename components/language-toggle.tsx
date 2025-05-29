"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "./language-provider"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 border rounded-md overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("es")}
        className={`px-2 py-1 h-8 rounded-none ${
          language === "es" ? "bg-primary text-primary-foreground" : "hover:bg-transparent hover:text-foreground"
        }`}
      >
        ES
      </Button>
      <div className="h-5 w-px bg-border"></div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 h-8 rounded-none ${
          language === "en" ? "bg-primary text-primary-foreground" : "hover:bg-transparent hover:text-foreground"
        }`}
      >
        EN
      </Button>
    </div>
  )
}
