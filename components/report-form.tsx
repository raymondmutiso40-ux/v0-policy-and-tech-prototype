"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, CheckCircle2, Shield, Lock, Upload, X, FileIcon, ImageIcon, VideoIcon } from "lucide-react"

const INCIDENT_TYPES = [
  { value: "cyber_stalking", label: "Cyber Stalking" },
  { value: "online_harassment", label: "Online Harassment" },
  { value: "non_consensual_intimate_images", label: "Non-Consensual Intimate Images (Revenge Porn)" },
  { value: "doxxing", label: "Doxxing (Publishing Private Info)" },
  { value: "identity_theft", label: "Identity Theft" },
  { value: "sextortion", label: "Sextortion" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "threats_of_violence", label: "Threats of Violence" },
  { value: "other", label: "Other" },
]

const PLATFORMS = [
  "Facebook",
  "WhatsApp",
  "Twitter/X",
  "Instagram",
  "TikTok",
  "Telegram",
  "Email",
  "SMS",
  "Dating App",
  "Other",
]

interface EvidenceFile {
  pathname: string
  filename: string
  size: number
  type: string
}

interface FormData {
  incident_type: string
  incident_description: string
  incident_date: string
  platform: string
  evidence_description: string
  evidence_files: EvidenceFile[]
  is_anonymous: boolean
  reporter_name: string
  reporter_email: string
  reporter_phone: string
  perpetrator_known: boolean
  perpetrator_description: string
}

export function ReportForm() {
  const [formData, setFormData] = useState<FormData>({
    incident_type: "",
    incident_description: "",
    incident_date: "",
    platform: "",
    evidence_description: "",
    evidence_files: [],
    is_anonymous: true,
    reporter_name: "",
    reporter_email: "",
    reporter_phone: "",
    perpetrator_known: false,
    perpetrator_description: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    success: boolean
    message: string
    case_number?: string
    submitted_data?: FormData
  } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formDataUpload = new FormData()
      for (let i = 0; i < files.length; i++) {
        formDataUpload.append('files', files[i])
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          evidence_files: [...prev.evidence_files, ...data.files]
        }))
        toast.success(`${data.files.length} file(s) uploaded successfully`)
      } else {
        setUploadError(data.error || 'Failed to upload files')
        toast.error('Upload failed', { description: data.error })
      }
    } catch {
      setUploadError('Network error during upload')
      toast.error('Network error', { description: 'Failed to upload files' })
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const removeFile = (pathname: string) => {
    setFormData(prev => ({
      ...prev,
      evidence_files: prev.evidence_files.filter(f => f.pathname !== pathname)
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (type.startsWith('video/')) return <VideoIcon className="h-4 w-4" />
    return <FileIcon className="h-4 w-4" />
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.incident_type) {
      newErrors.incident_type = "Please select an incident type"
    }
    if (!formData.incident_description || formData.incident_description.length < 20) {
      newErrors.incident_description = "Please provide a detailed description (at least 20 characters)"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Show success toast popup
        toast.success("Report Submitted Successfully!", {
          description: `Your case number is: ${data.case_number}`,
          duration: 10000,
          action: {
            label: "Copy Case #",
            onClick: () => {
              navigator.clipboard.writeText(data.case_number)
              toast.info("Case number copied to clipboard!")
            },
          },
        })
        
        setSubmitResult({
          success: true,
          message: data.message,
          case_number: data.case_number,
          submitted_data: { ...formData },
        })
        // Reset form
        setFormData({
          incident_type: "",
          incident_description: "",
          incident_date: "",
          platform: "",
          evidence_description: "",
          evidence_files: [],
          is_anonymous: true,
          reporter_name: "",
          reporter_email: "",
          reporter_phone: "",
          perpetrator_known: false,
          perpetrator_description: "",
        })
      } else {
        toast.error("Failed to Submit Report", {
          description: data.error || "Please try again or contact support.",
        })
        setSubmitResult({
          success: false,
          message: data.error || "Failed to submit report",
        })
      }
    } catch {
      toast.error("Network Error", {
        description: "Please check your internet connection and try again.",
      })
      setSubmitResult({
        success: false,
        message: "Network error. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitResult?.success) {
    const submittedData = submitResult.submitted_data
    const incidentLabel = INCIDENT_TYPES.find(t => t.value === submittedData?.incident_type)?.label || submittedData?.incident_type

    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            {/* Success Header */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Report Submitted Successfully</h3>
                <p className="mt-2 text-muted-foreground">{submitResult.message}</p>
              </div>
            </div>

            {/* Case Number */}
            {submitResult.case_number && (
              <div className="rounded-lg border border-primary/30 bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">Your Case Number</p>
                <p className="mt-1 font-mono text-2xl font-bold text-primary">{submitResult.case_number}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Save this number to track your case status
                </p>
              </div>
            )}

            {/* What Happens Next */}
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                What Happens Next
              </h4>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Your report is securely stored and assigned to a case officer</li>
                <li>The case will be reviewed within 24-48 hours</li>
                <li>If you provided contact info, you may be contacted for additional details</li>
                <li>Use your case number to track progress anytime</li>
              </ol>
            </div>

            {/* Submitted Details Summary */}
            {submittedData && (
              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-semibold text-foreground mb-3">Your Submitted Report</h4>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <dt className="text-muted-foreground">Incident Type</dt>
                    <dd className="font-medium text-foreground">{incidentLabel}</dd>
                  </div>
                  {submittedData.platform && (
                    <div className="flex justify-between border-b pb-2">
                      <dt className="text-muted-foreground">Platform</dt>
                      <dd className="font-medium text-foreground">{submittedData.platform}</dd>
                    </div>
                  )}
                  {submittedData.incident_date && (
                    <div className="flex justify-between border-b pb-2">
                      <dt className="text-muted-foreground">Incident Date</dt>
                      <dd className="font-medium text-foreground">{new Date(submittedData.incident_date).toLocaleDateString()}</dd>
                    </div>
                  )}
                  <div className="border-b pb-2">
                    <dt className="text-muted-foreground mb-1">Description</dt>
                    <dd className="font-medium text-foreground text-xs bg-muted/50 p-2 rounded">{submittedData.incident_description}</dd>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <dt className="text-muted-foreground">Report Type</dt>
                    <dd className="font-medium text-foreground">{submittedData.is_anonymous ? "Anonymous" : "Identified"}</dd>
                  </div>
                  {!submittedData.is_anonymous && submittedData.reporter_email && (
                    <div className="flex justify-between border-b pb-2">
                      <dt className="text-muted-foreground">Contact Email</dt>
                      <dd className="font-medium text-foreground">{submittedData.reporter_email}</dd>
                    </div>
                  )}
                  {submittedData.perpetrator_known && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Perpetrator Known</dt>
                      <dd className="font-medium text-foreground">Yes</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <Button onClick={() => setSubmitResult(null)} className="w-full">
              Submit Another Report
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Report an Incident</CardTitle>
        </div>
        <CardDescription>
          Your report is protected under Kenya&apos;s Data Protection Act, 2019 and your constitutional right to privacy (Article 31).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {/* Incident Type */}
            <Field>
              <FieldLabel htmlFor="incident_type">Type of Incident *</FieldLabel>
              <Select
                value={formData.incident_type}
                onValueChange={(value) => setFormData({ ...formData, incident_type: value })}
              >
                <SelectTrigger id="incident_type">
                  <SelectValue placeholder="Select the type of incident" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.incident_type && <FieldError>{errors.incident_type}</FieldError>}
            </Field>

            {/* Platform */}
            <Field>
              <FieldLabel htmlFor="platform">Platform Where It Occurred</FieldLabel>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select the platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Incident Date */}
            <Field>
              <FieldLabel htmlFor="incident_date">When Did This Happen?</FieldLabel>
              <Input
                id="incident_date"
                type="date"
                value={formData.incident_date}
                onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
              />
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="incident_description">Describe What Happened *</FieldLabel>
              <FieldDescription>
                Provide as much detail as possible. This helps us understand your situation better.
              </FieldDescription>
              <Textarea
                id="incident_description"
                placeholder="Describe the incident in detail..."
                value={formData.incident_description}
                onChange={(e) => setFormData({ ...formData, incident_description: e.target.value })}
                rows={5}
              />
              {errors.incident_description && <FieldError>{errors.incident_description}</FieldError>}
            </Field>

            {/* Evidence Upload */}
            <Field>
              <FieldLabel>Upload Evidence Files</FieldLabel>
              <FieldDescription>
                Upload screenshots, photos, videos, PDFs, or audio recordings (max 10MB each).
              </FieldDescription>
              
              {/* Upload Area */}
              <div className="mt-2">
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isUploading 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <>
                        <Spinner className="h-8 w-8 mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Images, Videos, PDFs, Audio (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* Upload Error */}
              {uploadError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {uploadError}
                </div>
              )}

              {/* Uploaded Files List */}
              {formData.evidence_files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Uploaded Files ({formData.evidence_files.length})
                  </p>
                  {formData.evidence_files.map((file) => (
                    <div
                      key={file.pathname}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(file.type)}
                        <span className="text-sm truncate">{file.filename}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.pathname)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            {/* Evidence Description */}
            <Field>
              <FieldLabel htmlFor="evidence_description">Additional Evidence Notes</FieldLabel>
              <FieldDescription>
                Describe any other evidence you have or cannot upload.
              </FieldDescription>
              <Textarea
                id="evidence_description"
                placeholder="e.g., I have more screenshots on my phone, witnesses who can confirm, etc."
                value={formData.evidence_description}
                onChange={(e) => setFormData({ ...formData, evidence_description: e.target.value })}
                rows={2}
              />
            </Field>

            {/* Perpetrator Known */}
            <Field orientation="horizontal">
              <Checkbox
                id="perpetrator_known"
                checked={formData.perpetrator_known}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, perpetrator_known: checked === true })
                }
              />
              <FieldLabel htmlFor="perpetrator_known">I know who the perpetrator is</FieldLabel>
            </Field>

            {formData.perpetrator_known && (
              <Field>
                <FieldLabel htmlFor="perpetrator_description">Perpetrator Information</FieldLabel>
                <Textarea
                  id="perpetrator_description"
                  placeholder="Describe what you know about the perpetrator (name, username, relationship, etc.)"
                  value={formData.perpetrator_description}
                  onChange={(e) => setFormData({ ...formData, perpetrator_description: e.target.value })}
                  rows={3}
                />
              </Field>
            )}

            {/* Anonymous Toggle */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Field orientation="horizontal">
                <Checkbox
                  id="is_anonymous"
                  checked={formData.is_anonymous}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_anonymous: checked === true })
                  }
                />
                <div className="flex flex-col gap-1">
                  <FieldLabel htmlFor="is_anonymous" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Report Anonymously
                  </FieldLabel>
                  <FieldDescription>
                    Your right to privacy is protected under Article 31 of the Constitution.
                  </FieldDescription>
                </div>
              </Field>
            </div>

            {/* Contact Info (if not anonymous) */}
            {!formData.is_anonymous && (
              <div className="space-y-4 rounded-lg border p-4">
                <p className="text-sm font-medium">Contact Information (Optional)</p>
                <Field>
                  <FieldLabel htmlFor="reporter_name">Your Name</FieldLabel>
                  <Input
                    id="reporter_name"
                    value={formData.reporter_name}
                    onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                    placeholder="Your full name"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reporter_email">Email Address</FieldLabel>
                  <Input
                    id="reporter_email"
                    type="email"
                    value={formData.reporter_email}
                    onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reporter_phone">Phone Number</FieldLabel>
                  <Input
                    id="reporter_phone"
                    type="tel"
                    value={formData.reporter_phone}
                    onChange={(e) => setFormData({ ...formData, reporter_phone: e.target.value })}
                    placeholder="+254 700 000 000"
                  />
                </Field>
              </div>
            )}

            {/* Submit Error */}
            {submitResult && !submitResult.success && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{submitResult.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
