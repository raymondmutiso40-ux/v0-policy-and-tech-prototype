"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { 
  Shield, 
  Lock, 
  FileText, 
  Clock, 
  Search as SearchIcon, 
  AlertTriangle,
  CheckCircle2,
  Eye,
  RefreshCw,
  LogOut,
  BarChart3,
  Users,
  Home
} from "lucide-react"

interface Report {
  id: string
  case_number: string
  incident_type: string
  incident_description: string
  incident_date: string | null
  platform: string | null
  evidence_description: string | null
  reporter_name: string | null
  reporter_email: string | null
  reporter_phone: string | null
  is_anonymous: boolean
  perpetrator_known: boolean
  perpetrator_description: string | null
  status: string
  priority: string
  created_at: string
  updated_at: string
}

interface Stats {
  total: number
  submitted: number
  under_review: number
  investigation: number
  resolved: number
  urgent: number
}

const INCIDENT_LABELS: Record<string, string> = {
  cyber_stalking: "Cyber Stalking",
  online_harassment: "Online Harassment",
  non_consensual_intimate_images: "Non-Consensual Images",
  doxxing: "Doxxing",
  identity_theft: "Identity Theft",
  sextortion: "Sextortion",
  hate_speech: "Hate Speech",
  threats_of_violence: "Threats of Violence",
  other: "Other",
}

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  investigation: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

export default function AdminDashboard() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cases, setCases] = useState<Report[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedCase, setSelectedCase] = useState<Report | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const fetchCases = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/cases?password=${encodeURIComponent(password)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch cases")
      }

      setCases(data.cases || [])
      setStats(data.stats || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cases")
    } finally {
      setIsLoading(false)
    }
  }, [password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/cases?password=${encodeURIComponent(password)}`)
      
      if (response.ok) {
        setIsAuthenticated(true)
        const data = await response.json()
        setCases(data.cases || [])
        setStats(data.stats || null)
      } else {
        setError("Invalid password")
      }
    } catch {
      setError("Connection error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (caseId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/cases?password=${encodeURIComponent(password)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, status: newStatus }),
      })

      if (response.ok) {
        fetchCases()
        if (selectedCase?.id === caseId) {
          setSelectedCase({ ...selectedCase, status: newStatus })
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err)
    }
  }

  const handlePriorityUpdate = async (caseId: string, newPriority: string) => {
    try {
      const response = await fetch(`/api/admin/cases?password=${encodeURIComponent(password)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, priority: newPriority }),
      })

      if (response.ok) {
        fetchCases()
        if (selectedCase?.id === caseId) {
          setSelectedCase({ ...selectedCase, priority: newPriority })
        }
      }
    } catch (err) {
      console.error("Failed to update priority:", err)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchCases, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchCases])

  const filteredCases = cases.filter(c => {
    const matchesStatus = filterStatus === "all" || c.status === filterStatus
    const matchesSearch = searchTerm === "" || 
      c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.incident_description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <Link href="/" className="absolute left-4 top-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              SafeReport Kenya - Authority Access Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                Access Dashboard
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Demo password: safereport2026
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-lg">SafeReport Admin</h1>
              <p className="text-xs text-muted-foreground">TFGBV Case Management</p>
            </div>
          </div>
<div className="flex items-center gap-2">
  <Link href="/">
    <Button variant="outline" size="sm">
      <Home className="h-4 w-4 mr-2" />
      Home
    </Button>
  </Link>
  <Button variant="outline" size="sm" onClick={fetchCases} disabled={isLoading}>
  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
  Refresh
  </Button>
  <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)}>
  <LogOut className="h-4 w-4 mr-2" />
> Logout
  </Button>
  </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Cases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.submitted}</p>
                    <p className="text-xs text-muted-foreground">New</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.under_review}</p>
                    <p className="text-xs text-muted-foreground">Under Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <SearchIcon className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.investigation}</p>
                    <p className="text-xs text-muted-foreground">Investigation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.resolved}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                    <p className="text-xs text-red-600">Urgent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="investigation">Investigation</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cases List and Detail */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cases List */}
          <Card className="lg:max-h-[600px] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cases ({filteredCases.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredCases.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No cases found</p>
              ) : (
                filteredCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedCase?.id === c.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-sm font-medium">{c.case_number}</span>
                      <Badge className={PRIORITY_COLORS[c.priority]}>{c.priority}</Badge>
                    </div>
                    <p className="text-sm font-medium">{INCIDENT_LABELS[c.incident_type] || c.incident_type}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.incident_description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge className={STATUS_COLORS[c.status]}>{c.status.replace("_", " ")}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Case Detail */}
          <Card className="lg:max-h-[600px] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Case Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCase ? (
                <p className="text-center text-muted-foreground py-8">Select a case to view details</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-bold">{selectedCase.case_number}</span>
                    <div className="flex gap-2">
                      <Badge className={STATUS_COLORS[selectedCase.status]}>
                        {selectedCase.status.replace("_", " ")}
                      </Badge>
                      <Badge className={PRIORITY_COLORS[selectedCase.priority]}>
                        {selectedCase.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Select
                      value={selectedCase.status}
                      onValueChange={(val) => handleStatusUpdate(selectedCase.id, val)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="investigation">Investigation</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedCase.priority}
                      onValueChange={(val) => handlePriorityUpdate(selectedCase.id, val)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Incident Type</p>
                      <p className="font-medium">{INCIDENT_LABELS[selectedCase.incident_type] || selectedCase.incident_type}</p>
                    </div>
                    {selectedCase.platform && (
                      <div>
                        <p className="text-xs text-muted-foreground">Platform</p>
                        <p className="font-medium">{selectedCase.platform}</p>
                      </div>
                    )}
                    {selectedCase.incident_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Incident Date</p>
                        <p className="font-medium">{new Date(selectedCase.incident_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm bg-muted/50 p-3 rounded mt-1">{selectedCase.incident_description}</p>
                    </div>
                    {selectedCase.evidence_description && (
                      <div>
                        <p className="text-xs text-muted-foreground">Evidence</p>
                        <p className="text-sm bg-muted/50 p-3 rounded mt-1">{selectedCase.evidence_description}</p>
                      </div>
                    )}
                  </div>

                  {/* Reporter Info */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4" />
                      <p className="font-medium">Reporter Information</p>
                    </div>
                    {selectedCase.is_anonymous ? (
                      <p className="text-sm text-muted-foreground italic">Anonymous report</p>
                    ) : (
                      <div className="space-y-2 text-sm">
                        {selectedCase.reporter_name && <p><span className="text-muted-foreground">Name:</span> {selectedCase.reporter_name}</p>}
                        {selectedCase.reporter_email && <p><span className="text-muted-foreground">Email:</span> {selectedCase.reporter_email}</p>}
                        {selectedCase.reporter_phone && <p><span className="text-muted-foreground">Phone:</span> {selectedCase.reporter_phone}</p>}
                      </div>
                    )}
                  </div>

                  {/* Perpetrator Info */}
                  {selectedCase.perpetrator_known && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground">Perpetrator Information</p>
                      <p className="text-sm bg-muted/50 p-3 rounded mt-1">{selectedCase.perpetrator_description || "No details provided"}</p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="border-t pt-4 text-xs text-muted-foreground">
                    <p>Submitted: {new Date(selectedCase.created_at).toLocaleString()}</p>
                    <p>Last Updated: {new Date(selectedCase.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
