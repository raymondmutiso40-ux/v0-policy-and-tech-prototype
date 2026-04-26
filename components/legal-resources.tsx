"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Shield, Phone, Globe, Mail, AlertTriangle, Scale, Users } from "lucide-react"

const authorities = [
  {
    name: "Office of the Data Protection Commissioner (ODPC)",
    description: "Enforces the Data Protection Act, 2019. Handles complaints about misuse of personal data, doxxing, and non-consensual sharing of intimate images.",
    jurisdiction: "Data Privacy",
    icon: Shield,
    contacts: {
      website: "https://odpc.go.ke",
      email: "info@odpc.go.ke",
      phone: "+254 20 2714092"
    },
    priority: true
  },
  {
    name: "DCI Cybercrime Unit",
    description: "Investigates cyber stalking, online harassment, sextortion, identity theft, and digital threats under the Computer Misuse and Cybercrimes Act, 2018.",
    jurisdiction: "Criminal Investigation",
    icon: AlertTriangle,
    contacts: {
      website: "https://www.dci.go.ke",
      phone: "999 / 112 (Emergency)",
      email: "info@cid.go.ke"
    },
    priority: true
  },
  {
    name: "Communications Authority of Kenya (CA)",
    description: "Regulates online platforms. Can order takedown of harmful content and investigate platform violations.",
    jurisdiction: "Content Regulation",
    icon: Globe,
    contacts: {
      website: "https://ca.go.ke",
      phone: "+254 20 4242000",
      email: "info@ca.go.ke"
    },
    priority: false
  },
  {
    name: "National Gender and Equality Commission (NGEC)",
    description: "Monitors gender-based violence including tech-facilitated forms. Provides policy guidance and victim support referrals.",
    jurisdiction: "Gender & Equality",
    icon: Users,
    contacts: {
      website: "https://ngeckenya.org",
      phone: "+254 20 2721936",
      email: "info@ngeckenya.org"
    },
    priority: false
  },
  {
    name: "Kenya National Commission on Human Rights (KNCHR)",
    description: "Constitutional body protecting fundamental rights under Articles 31, 33, and 48 of the Constitution.",
    jurisdiction: "Human Rights",
    icon: Scale,
    contacts: {
      website: "https://www.knchr.org",
      phone: "+254 20 2717908",
      email: "haki@knchr.org"
    },
    priority: false
  },
  {
    name: "Office of the Director of Public Prosecutions (ODPP)",
    description: "Prosecutes TFGBV cases under the Computer Misuse and Cybercrimes Act, 2018 and other applicable laws.",
    jurisdiction: "Prosecution",
    icon: Building2,
    contacts: {
      website: "https://www.odpp.go.ke",
      phone: "+254 20 2732028",
      email: "odpp@odpp.go.ke"
    },
    priority: false
  }
]

export function LegalResources() {
  return (
    <section className="py-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground">Legal Authorities & Resources</h2>
        <p className="mt-2 text-muted-foreground">
          Kenyan authorities responsible for handling TFGBV cases
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {authorities.map((authority) => {
          const Icon = authority.icon
          return (
            <Card key={authority.name} className={authority.priority ? "border-primary/30 bg-primary/5" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${authority.priority ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">{authority.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {authority.jurisdiction}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-4 text-sm">
                  {authority.description}
                </CardDescription>
                <div className="space-y-2 text-sm">
                  {authority.contacts.phone && (
                    <a 
                      href={`tel:${authority.contacts.phone.replace(/[^0-9+]/g, '')}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {authority.contacts.phone}
                    </a>
                  )}
                  {authority.contacts.email && (
                    <a 
                      href={`mailto:${authority.contacts.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {authority.contacts.email}
                    </a>
                  )}
                  {authority.contacts.website && (
                    <a 
                      href={authority.contacts.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {authority.contacts.website.replace('https://', '')}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6 border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-start gap-4 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Emergency Situations</p>
            <p className="mt-1 text-muted-foreground">
              If you are in immediate danger, call <strong>999</strong> or <strong>112</strong> (Kenya Police Emergency Line) immediately. 
              For gender-based violence emergencies, you can also contact the GBV Hotline at <strong>1195</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
