"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generatePitch } from "@/lib/generate-pitch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Download, Printer, Copy, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PitchFormData {
  problem: string
  solution: string
  uniqueness: string
  market: string
  traction: string
  business: string
  team: string
  ask: string
}

export default function Dashboard() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("form")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPitch, setGeneratedPitch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const pitchRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<PitchFormData>({
    problem: "",
    solution: "",
    uniqueness: "",
    market: "",
    traction: "",
    business: "",
    team: "",
    ask: "",
  })

  const handleInputChange = (field: keyof PitchFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      // No longer passing language parameter
      const pitch = await generatePitch(formData)
      setGeneratedPitch(pitch)
      setActiveTab("result")
    } catch (error) {
      console.error("Error generating pitch:", error)

      // Better error handling with English messages
      if (error instanceof Error) {
        setError(`Error generating pitch: ${error.message}`)
      } else {
        setError(
          "An unexpected error occurred while generating your pitch. Please check your API configuration and try again.",
        )
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyToClipboard = () => {
    if (generatedPitch) {
      navigator.clipboard.writeText(generatedPitch)
      toast({
        title: t("pitch.copied"),
        description: t("pitch.copied.description"),
      })
    }
  }

  const handleDownload = () => {
    if (generatedPitch) {
      const element = document.createElement("a")
      const file = new Blob([generatedPitch], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = "pitch-canvas.txt"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  // Enhanced function to format the pitch text with better styling
  const formatPitchText = (text: string) => {
    if (!text) return null

    // Split the text by lines
    const lines = text.split("\n")
    const formattedLines = lines.map((line, index) => {
      // Main headers (# or ##)
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-primary border-b pb-2">
            {line.substring(2)}
          </h1>
        )
      } else if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-xl font-semibold mt-5 mb-3 text-primary/90">
            {line.substring(3)}
          </h2>
        )
      } else if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-primary/80">
            {line.substring(4)}
          </h3>
        )
      } else if (line.trim() === "") {
        return <div key={index} className="h-2"></div> // Empty line spacing
      } else if (line.startsWith("- ")) {
        return (
          <li key={index} className="my-1 ml-4 list-disc leading-relaxed">
            {line.substring(2)}
          </li>
        )
      } else if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
        return (
          <li key={index} className="my-1 ml-4 list-decimal leading-relaxed">
            {line.substring(line.indexOf(" ") + 1)}
          </li>
        )
      } else {
        return (
          <p key={index} className="my-2 leading-relaxed">
            {line}
          </p>
        )
      }
    })

    return (
      <div className="space-y-1 pitch-content p-8 bg-card border rounded-md shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-2xl font-bold">{t("pitch.your3min")}</h2>
          </div>
          <div className="text-sm text-muted-foreground">{t("pitch.based")}</div>
        </div>
        <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">{formattedLines}</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">{t("pitch.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("pitch.subtitle")}</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">{t("pitch.canvas")}</TabsTrigger>
            <TabsTrigger value="result" disabled={!generatedPitch}>
              {t("pitch.result")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>{t("pitch.canvas.title")}</CardTitle>
                <CardDescription>{t("pitch.canvas.description")}</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="problem">{t("pitch.problem")}</Label>
                      <Textarea
                        id="problem"
                        placeholder={t("pitch.problem.placeholder")}
                        value={formData.problem}
                        onChange={(e) => handleInputChange("problem", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="solution">{t("pitch.solution")}</Label>
                      <Textarea
                        id="solution"
                        placeholder={t("pitch.solution.placeholder")}
                        value={formData.solution}
                        onChange={(e) => handleInputChange("solution", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uniqueness">{t("pitch.uniqueness")}</Label>
                      <Textarea
                        id="uniqueness"
                        placeholder={t("pitch.uniqueness.placeholder")}
                        value={formData.uniqueness}
                        onChange={(e) => handleInputChange("uniqueness", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="market">{t("pitch.market")}</Label>
                      <Textarea
                        id="market"
                        placeholder={t("pitch.market.placeholder")}
                        value={formData.market}
                        onChange={(e) => handleInputChange("market", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="traction">{t("pitch.traction")}</Label>
                      <Textarea
                        id="traction"
                        placeholder={t("pitch.traction.placeholder")}
                        value={formData.traction}
                        onChange={(e) => handleInputChange("traction", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business">{t("pitch.business")}</Label>
                      <Textarea
                        id="business"
                        placeholder={t("pitch.business.placeholder")}
                        value={formData.business}
                        onChange={(e) => handleInputChange("business", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team">{t("pitch.team")}</Label>
                      <Textarea
                        id="team"
                        placeholder={t("pitch.team.placeholder")}
                        value={formData.team}
                        onChange={(e) => handleInputChange("team", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ask">{t("pitch.ask")}</Label>
                      <Textarea
                        id="ask"
                        placeholder={t("pitch.ask.placeholder")}
                        value={formData.ask}
                        onChange={(e) => handleInputChange("ask", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? t("pitch.generating") : t("pitch.generate")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="result">
            <Card>
              <CardHeader>
                <CardTitle>{t("pitch.result.title")}</CardTitle>
                <CardDescription>{t("pitch.result.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={pitchRef}>{formatPitchText(generatedPitch)}</div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3 justify-between">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setActiveTab("form")}>
                    {t("pitch.edit")}
                  </Button>
                  <Button variant="outline" onClick={handleCopyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t("pitch.copy")}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    {t("pitch.print")}
                  </Button>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    {t("pitch.download")}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
