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

interface NewCaseNotificationData {
  case_number: string
  incident_type: string
  incident_description: string
  platform?: string
  is_anonymous: boolean
  reporter_email?: string
  has_evidence_files: boolean
  created_at: string
}

export async function sendNewCaseNotification(data: NewCaseNotificationData) {
  const authorityEmail = process.env.AUTHORITY_EMAIL

  if (!authorityEmail) {
    console.error("[v0] AUTHORITY_EMAIL not configured")
    return { success: false, error: "Authority email not configured" }
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[v0] RESEND_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  const incidentLabel = INCIDENT_LABELS[data.incident_type] || data.incident_type
  const adminUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
    : "https://your-app-url.vercel.app/admin"

  try {
    const { error } = await resend.emails.send({
      from: "SafeReport Kenya <onboarding@resend.dev>",
      to: authorityEmail,
      subject: `🚨 New TFGBV Case Reported: ${data.case_number}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0d9488; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .case-number { font-size: 24px; font-weight: bold; color: #0d9488; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .badge-urgent { background: #fef2f2; color: #dc2626; }
            .badge-info { background: #ecfdf5; color: #059669; }
            .detail-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
            .detail-value { margin-top: 4px; }
            .button { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🛡️ SafeReport Kenya</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">New TFGBV Case Alert</p>
            </div>
            
            <div class="content">
              <p>A new case of Tech-Facilitated Gender-Based Violence has been reported and requires your attention.</p>
              
              <div class="detail-row">
                <div class="detail-label">Case Number</div>
                <div class="detail-value case-number">${data.case_number}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Incident Type</div>
                <div class="detail-value">
                  <span class="badge badge-urgent">${incidentLabel}</span>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Platform</div>
                <div class="detail-value">${data.platform || "Not specified"}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">${data.incident_description.substring(0, 200)}${data.incident_description.length > 200 ? "..." : ""}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Reporter</div>
                <div class="detail-value">
                  ${data.is_anonymous 
                    ? '<span class="badge badge-info">Anonymous Report</span>' 
                    : `Contact available: ${data.reporter_email || "Check dashboard"}`
                  }
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Evidence</div>
                <div class="detail-value">
                  ${data.has_evidence_files 
                    ? '<span class="badge badge-info">Evidence files attached</span>' 
                    : "No files attached"
                  }
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Submitted</div>
                <div class="detail-value">${new Date(data.created_at).toLocaleString("en-KE", { 
                  dateStyle: "full", 
                  timeStyle: "short",
                  timeZone: "Africa/Nairobi"
                })}</div>
              </div>
              
              <div style="margin-top: 24px; text-align: center;">
                <a href="${adminUrl}" class="button">View Case in Dashboard</a>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from SafeReport Kenya TFGBV Reporting Portal.</p>
              <p>Anchored in Kenya's Data Protection Act, 2019 and Constitution Articles 31, 33, 48.</p>
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

    console.log("[v0] Email notification sent to:", authorityEmail)
    return { success: true }
  } catch (error) {
    console.error("[v0] Email sending error:", error)
    return { success: false, error: "Failed to send email" }
  }
}
