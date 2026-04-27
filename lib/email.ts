import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

// Map incident types to relevant authorities
// Each incident type can be routed to multiple authorities
const AUTHORITY_ROUTING: Record<string, string[]> = {
  // Data privacy violations → ODPC
  doxxing: ["ODPC", "DCI"],
  identity_theft: ["ODPC", "DCI"],
  
  // Criminal offenses → DCI Cybercrime Unit
  cyber_stalking: ["DCI", "NGEC"],
  threats_of_violence: ["DCI", "NGEC"],
  sextortion: ["DCI", "NGEC"],
  
  // Content-related → Communications Authority + NGEC
  non_consensual_intimate_images: ["CA", "DCI", "NGEC"],
  hate_speech: ["CA", "NGEC"],
  online_harassment: ["DCI", "NGEC", "CA"],
  
  // General
  other: ["NGEC", "DCI"],
}

// Authority details for the email
const AUTHORITIES: Record<string, { name: string; fullName: string; jurisdiction: string }> = {
  ODPC: {
    name: "ODPC",
    fullName: "Office of the Data Protection Commissioner",
    jurisdiction: "Data Protection Act, 2019"
  },
  DCI: {
    name: "DCI Cybercrime",
    fullName: "DCI Cybercrime Unit",
    jurisdiction: "Computer Misuse and Cybercrimes Act, 2018"
  },
  CA: {
    name: "CA",
    fullName: "Communications Authority of Kenya",
    jurisdiction: "Kenya Information and Communications Act"
  },
  NGEC: {
    name: "NGEC",
    fullName: "National Gender and Equality Commission",
    jurisdiction: "Gender-Based Violence Monitoring"
  },
}

interface NewCaseNotificationData {
  caseNumber: string
  incidentType: string
  description: string
  platform: string
  isAnonymous: boolean
  reporterEmail?: string
  hasEvidence: boolean
  submittedAt: string
}

function getAuthoritiesForIncident(incidentType: string): string[] {
  return AUTHORITY_ROUTING[incidentType] || AUTHORITY_ROUTING.other
}

export async function sendNewCaseNotification(data: NewCaseNotificationData) {
  // Get the primary authority email (from env) and any additional emails
  // AUTHORITY_EMAIL can be comma-separated for multiple addresses
  // e.g., "odpc@example.com,dci@example.com,ngec@example.com"
  const authorityEmails = process.env.AUTHORITY_EMAIL?.split(",").map(e => e.trim()).filter(Boolean) || []

  if (authorityEmails.length === 0) {
    console.error("[v0] AUTHORITY_EMAIL not configured")
    return { success: false, error: "Authority email not configured" }
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[v0] RESEND_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  const incidentLabel = INCIDENT_LABELS[data.incidentType] || data.incidentType
  const relevantAuthorities = getAuthoritiesForIncident(data.incidentType)
  const authorityDetails = relevantAuthorities.map(code => AUTHORITIES[code]).filter(Boolean)
  
  const adminUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
    : "/admin"

  try {
    // Send to all configured authority emails
    const { error } = await resend.emails.send({
      from: "SafeReport Kenya <onboarding@resend.dev>",
      to: authorityEmails,
      subject: `[URGENT] New TFGBV Case: ${data.caseNumber} - ${incidentLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; padding: 24px; }
            .header h1 { margin: 0; font-size: 20px; }
            .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
            .alert-banner { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 0; }
            .alert-banner p { margin: 0; color: #991b1b; font-weight: 500; }
            .content { padding: 24px; background: #ffffff; }
            .case-box { background: #f0fdfa; border: 2px solid #0d9488; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px; }
            .case-number { font-size: 28px; font-weight: bold; color: #0d9488; font-family: monospace; }
            .case-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 2px; }
            .badge-red { background: #fef2f2; color: #dc2626; }
            .badge-green { background: #ecfdf5; color: #059669; }
            .badge-blue { background: #eff6ff; color: #2563eb; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
            .section-content { color: #1f2937; }
            .authorities-box { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .authority-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .authority-item:last-child { border-bottom: none; }
            .authority-name { font-weight: 600; color: #0d9488; }
            .authority-jurisdiction { font-size: 12px; color: #6b7280; }
            .button { display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
            .button:hover { background: #0f766e; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { margin: 4px 0; color: #6b7280; font-size: 12px; }
            .legal { font-size: 11px; color: #9ca3af; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SafeReport Kenya</h1>
              <p>TFGBV Reporting Portal - Case Alert</p>
            </div>
            
            <div class="alert-banner">
              <p>A new case of Tech-Facilitated Gender-Based Violence requires immediate attention.</p>
            </div>
            
            <div class="content">
              <div class="case-box">
                <div class="case-label">Case Number</div>
                <div class="case-number">${data.caseNumber}</div>
              </div>
              
              <div class="section">
                <div class="section-title">Incident Type</div>
                <div class="section-content">
                  <span class="badge badge-red">${incidentLabel}</span>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">Platform</div>
                <div class="section-content">${data.platform}</div>
              </div>
              
              <div class="section">
                <div class="section-title">Description</div>
                <div class="section-content">${data.description.substring(0, 300)}${data.description.length > 300 ? "..." : ""}</div>
              </div>
              
              <div class="section">
                <div class="section-title">Reporter Status</div>
                <div class="section-content">
                  ${data.isAnonymous 
                    ? '<span class="badge badge-blue">Anonymous Report</span>' 
                    : '<span class="badge badge-green">Contact Information Available</span>'
                  }
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">Evidence</div>
                <div class="section-content">
                  ${data.hasEvidence 
                    ? '<span class="badge badge-green">Evidence Files Attached</span>' 
                    : '<span class="badge badge-blue">No Files Attached</span>'
                  }
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">Submitted</div>
                <div class="section-content">${new Date(data.submittedAt).toLocaleString("en-KE", { 
                  dateStyle: "full", 
                  timeStyle: "short",
                  timeZone: "Africa/Nairobi"
                })}</div>
              </div>
              
              <div class="authorities-box">
                <div class="section-title">Relevant Authorities for This Case</div>
                ${authorityDetails.map(auth => `
                  <div class="authority-item">
                    <div>
                      <div class="authority-name">${auth.fullName}</div>
                      <div class="authority-jurisdiction">${auth.jurisdiction}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div style="text-align: center;">
                <a href="${adminUrl}" class="button">View Full Case Details</a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>SafeReport Kenya</strong> - TFGBV Reporting Portal</p>
              <p>This notification was sent to all relevant authorities based on incident type.</p>
              <p class="legal">Anchored in Kenya's Data Protection Act, 2019 and Constitution Articles 31 (Privacy), 33 (Expression), and 48 (Access to Justice).</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("[v0] Failed to send email:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Email notification sent to:", authorityEmails.join(", "))
    return { success: true, sentTo: authorityEmails }
  } catch (error) {
    console.error("[v0] Email sending error:", error)
    return { success: false, error: "Failed to send email" }
  }
}
