import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ReportForm } from "@/components/report-form"
import { TrackCase } from "@/components/track-case"
import { LegalResources } from "@/components/legal-resources"
import { Shield, FileText, Search, Scale, Lock, Users, Building2, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">SafeReport Kenya</h1>
              <p className="text-xs text-muted-foreground">TFGBV Reporting Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:flex">
              <Lock className="h-3 w-3" />
              Secure & Confidential
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-card py-12">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Report Tech-Facilitated Gender-Based Violence
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
            A secure, anonymous platform for reporting online harassment, cyber stalking, 
            revenge porn, and other forms of digital violence. Your privacy is protected 
            by law.
          </p>
        </div>
      </section>

      {/* Legal Framework Banner */}
      <section className="border-b bg-primary/5 py-6">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4 text-primary" />
              <span>Data Protection Act, 2019</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4 text-primary" />
              <span>Article 31 - Right to Privacy</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>Article 48 - Access to Justice</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="report" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Report</span>
              <span className="sm:hidden">Report</span>
            </TabsTrigger>
            <TabsTrigger value="track" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Track Case</span>
              <span className="sm:hidden">Track</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
              <span className="sm:hidden">Help</span>
            </TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="report">
              <ReportForm />
            </TabsContent>
            <TabsContent value="track">
              <TrackCase />
            </TabsContent>
            <TabsContent value="resources">
              <LegalResources />
            </TabsContent>
          </div>
        </Tabs>

        {/* Info Section */}
        <section className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Anonymous Reporting</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Report incidents without revealing your identity. Your privacy is constitutionally protected.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Secure Platform</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              All data is encrypted and handled in compliance with Kenya&apos;s Data Protection Act.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Legal Support</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Cases are reviewed and can be escalated to appropriate legal authorities if needed.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>
            <strong>SafeReport Kenya</strong> - Afro-IP Law &amp; Tech Hackathon 2026
          </p>
          <p className="mt-2">
            Anchored in the Constitution of Kenya (2010) and Data Protection Act, 2019
          </p>
          <p className="mt-1">
            Articles 31 (Privacy), 33 (Expression), 48 (Access to Justice)
          </p>
        </div>
      </footer>
    </div>
  )
}
