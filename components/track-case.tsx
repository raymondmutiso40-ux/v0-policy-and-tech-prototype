"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle, Clock, FileSearch } from "lucide-react"

interface CaseStatus {
  case_number: string
  status: string
  incident_type: string
  submitted_at: string
  last_updated: string
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  submitted: { label: "Submitted", variant: "secondary" },
  under_review: { label: "Under Review", variant: "default" },
  investigation: { label: "Investigation", variant: "default" },
  resolved: { label: "Resolved", variant: "outline" },
  closed: { label: "Closed", variant: "outline" },
}

const INCIDENT_LABELS: Record<string, string> = {
  cyber_stalking: "Cyber Stalking",
  online_harassment: "Online Harassment",
  non_consensual_intimate_images: "Non-Consensual Intimate Images",
  doxxing: "Doxxing",
  identity_theft: "Identity Theft",
  sextortion: "Sextortion",
  hate_speech: "Hate Speech",
  threats_of_violence: "Threats of Violence",
  other: "Other",
}

export function TrackCase() {
  const [caseNumber, setCaseNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caseNumber.trim()) {
      setError("Please enter a case number")
      return
    }

    setIsLoading(true)
    setError(null)
    setCaseStatus(null)

    try {
      const response = await fetch(`/api/reports/track?case_number=${encodeURIComponent(caseNumber.trim())}`)
      const data = await response.json()

      if (response.ok) {
        setCaseStatus(data.report)
        toast.success("Case Found!", {
          description: `Status: ${STATUS_CONFIG[data.report.status]?.label || data.report.status}`,
        })
      } else {
        toast.error("Case Not Found", {
          description: "Please check your case number and try again.",
        })
        setError(data.error || "Case not found")
      }
    } catch {
      toast.error("Network Error", {
        description: "Please check your connection and try again.",
      })
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSearch className="h-5 w-5 text-primary" />
          <CardTitle>Track Your Case</CardTitle>
        </div>
        <CardDescription>
          Enter your case number to check the status of your report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="case_number">Case Number</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="case_number"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="TFGBV-20260425-XXXXXXXX"
                className="font-mono"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </Field>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {caseStatus && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Case Number</p>
                  <p className="font-mono text-lg font-semibold">{caseStatus.case_number}</p>
                </div>
                <Badge variant={STATUS_CONFIG[caseStatus.status]?.variant || "secondary"}>
                  {STATUS_CONFIG[caseStatus.status]?.label || caseStatus.status}
                </Badge>
              </div>

              <div className="mt-6 grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Incident Type</p>
                  <p className="font-medium">
                    {INCIDENT_LABELS[caseStatus.incident_type] || caseStatus.incident_type}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted On</p>
                    <p className="flex items-center gap-1 text-sm">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(caseStatus.submitted_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="flex items-center gap-1 text-sm">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(caseStatus.last_updated)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Your case is being handled in accordance with the Data Protection Act, 2019.
                  All information is kept strictly confidential.
                </p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
