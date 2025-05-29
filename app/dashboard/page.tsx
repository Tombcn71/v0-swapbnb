"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
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
      const pitch = await generatePitch(formData)
      setGeneratedPitch(pitch)
      setActiveTab("result")
    } catch (error) {
      console.error("Error generating pitch:", error)

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
        title: "Copied to clipboard",
        description: "Your pitch has been copied to the clipboard",
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

  const formatPitchText = (text: string) => {
    if (!text) return null

    const lines = text.split("\n")
    const formattedLines = lines.map((line, index) => {
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
        return <div key={index} className="h-2"></div>
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
            <h2 className="text-2xl font-bold">Your 3-Minute Pitch</h2>
          </div>
          <div className="text-sm text-muted-foreground">Based on David Beckett's Pitch Canvas</div>
        </div>
        <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">{formattedLines}</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Pitch Canvas Generator</h1>
        <p className="text-muted-foreground mb-8">Create your perfect pitch with AI</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Pitch Canvas</TabsTrigger>
            <TabsTrigger value="result" disabled={!generatedPitch}>
              Generated Pitch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>David Beckett's Pitch Canvas</CardTitle>
                <CardDescription>Fill in the details below to generate your 3-minute pitch</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="problem">Problem</Label>
                      <Textarea
                        id="problem"
                        placeholder="What problem are you solving?"
                        value={formData.problem}
                        onChange={(e) => handleInputChange("problem", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="solution">Solution</Label>
                      <Textarea
                        id="solution"
                        placeholder="How does your solution work?"
                        value={formData.solution}
                        onChange={(e) => handleInputChange("solution", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uniqueness">Uniqueness</Label>
                      <Textarea
                        id="uniqueness"
                        placeholder="What makes your solution unique?"
                        value={formData.uniqueness}
                        onChange={(e) => handleInputChange("uniqueness", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="market">Target Market</Label>
                      <Textarea
                        id="market"
                        placeholder="Who is your target audience?"
                        value={formData.market}
                        onChange={(e) => handleInputChange("market", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="traction">Traction</Label>
                      <Textarea
                        id="traction"
                        placeholder="What traction do you have so far?"
                        value={formData.traction}
                        onChange={(e) => handleInputChange("traction", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business">Business Model</Label>
                      <Textarea
                        id="business"
                        placeholder="How will you generate revenue?"
                        value={formData.business}
                        onChange={(e) => handleInputChange("business", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team">Team</Label>
                      <Textarea
                        id="team"
                        placeholder="Who is part of your team?"
                        value={formData.team}
                        onChange={(e) => handleInputChange("team", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ask">The Ask</Label>
                      <Textarea
                        id="ask"
                        placeholder="What are you asking for?"
                        value={formData.ask}
                        onChange={(e) => handleInputChange("ask", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Pitch"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="result">
            <Card>
              <CardHeader>
                <CardTitle>Your Generated Pitch</CardTitle>
                <CardDescription>
                  Here's your AI-generated 3-minute pitch based on David Beckett's method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={pitchRef}>{formatPitchText(generatedPitch)}</div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3 justify-between">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setActiveTab("form")}>
                    Edit Canvas
                  </Button>
                  <Button variant="outline" onClick={handleCopyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Text
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
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
