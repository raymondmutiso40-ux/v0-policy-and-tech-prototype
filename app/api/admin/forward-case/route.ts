import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

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

// POST - Forward case to selected authorities
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { caseId, authorityIds } = body

    if (!caseId || !authorityIds || authorityIds.length === 0) {
      return NextResponse.json(
        { error: "Case ID and at least one authority are required" },
        { status: 400 }
      )
    }

    // Fetch the case details
    const { data: caseData, error: caseError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Fetch selected authorities
    const { data: authorities, error: authError } = await supabase
      .from("authorities")
      .select("*")
      .in("id", authorityIds)

    if (authError || !authorities || authorities.length === 0) {
      return NextResponse.json({ error: "Authorities not found" }, { status: 404 })
    }

    // Send email to each authority
    const emails = authorities.map(auth => auth.email)
    const authorityNames = authorities.map(auth => auth.name).join(", ")

    const adminUrl = process.env.NEXT_PUBLIC_APP_URL || "https://safereport-kenya.vercel.app"

    const { error: emailError } = await resend.emails.send({
      from: "SafeReport Kenya <onboarding@resend.dev>",
      to: emails,
      subject: `[URGENT] TFGBV Case Forwarded: ${caseData.case_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0d9488; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">SafeReport Kenya</h1>
            <p style="margin: 5px 0 0 0;">TFGBV Reporting Portal</p>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <div style="background: #dc2626; color: white; padding: 10px 15px; border-radius: 5px; margin-bottom: 20px;">
              <strong>CASE FORWARDED FOR ACTION</strong>
            </div>
            
            <h2 style="color: #1f2937; margin-top: 0;">Case Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 40%;">Case Number:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${caseData.case_number}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Incident Type:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${INCIDENT_LABELS[caseData.incident_type] || caseData.incident_type}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Platform:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${caseData.platform || "Not specified"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Submitted:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${new Date(caseData.created_at).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Status:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${caseData.status}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Priority:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: ${caseData.priority === 'urgent' ? '#dc2626' : caseData.priority === 'high' ? '#f97316' : '#1f2937'};">
                  ${caseData.priority?.toUpperCase() || "MEDIUM"}
                </td>
              </tr>
            </table>
            
            <h3 style="color: #1f2937; margin-top: 20px;">Description</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb;">
              ${caseData.incident_description}
            </div>
            
            ${!caseData.is_anonymous && caseData.reporter_email ? `
            <h3 style="color: #1f2937; margin-top: 20px;">Reporter Contact</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb;">
              <p><strong>Name:</strong> ${caseData.reporter_name || "Not provided"}</p>
              <p><strong>Email:</strong> ${caseData.reporter_email}</p>
              <p><strong>Phone:</strong> ${caseData.reporter_phone || "Not provided"}</p>
            </div>
            ` : `
            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <strong>Note:</strong> This report was submitted anonymously.
            </div>
            `}
            
            <h3 style="color: #1f2937; margin-top: 20px;">Forwarded To</h3>
            <p>${authorityNames}</p>
            
            <div style="margin-top: 30px; padding: 20px; background: #0d9488; border-radius: 5px; text-align: center;">
              <p style="color: white; margin: 0 0 15px 0;">This case requires your attention and action.</p>
            </div>
          </div>
          
          <div style="padding: 20px; background: #1f2937; color: #9ca3af; text-align: center; font-size: 12px;">
            <p>SafeReport Kenya - TFGBV Reporting Portal</p>
            <p>Anchored in Kenya's Data Protection Act 2019 and Constitution Articles 31, 33, 48</p>
          </div>
        </div>
      `,
    })

    if (emailError) {
      console.error("Email error:", emailError)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Update case status to show it was forwarded
    await supabase
      .from("reports")
      .update({ status: "under_review" })
      .eq("id", caseId)

    return NextResponse.json({ 
      success: true, 
      message: `Case forwarded to ${authorities.length} authority(ies)`,
      forwardedTo: authorityNames
    })
  } catch (error) {
    console.error("Error forwarding case:", error)
    return NextResponse.json({ error: "Failed to forward case" }, { status: 500 })
  }
}
