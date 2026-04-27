import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// POST - Submit a new report
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.incident_type || !body.incident_description) {
      return NextResponse.json(
        { error: "Incident type and description are required" },
        { status: 400 }
      )
    }

    // Insert the report
    const { data, error } = await supabase
      .from("reports")
      .insert({
        incident_type: body.incident_type,
        incident_description: body.incident_description,
        incident_date: body.incident_date || null,
        platform: body.platform || null,
        evidence_description: body.evidence_description || null,
        evidence_urls: body.evidence_urls || null,
        evidence_files: body.evidence_files || [],
        reporter_name: body.is_anonymous ? null : body.reporter_name,
        reporter_email: body.is_anonymous ? null : body.reporter_email,
        reporter_phone: body.is_anonymous ? null : body.reporter_phone,
        is_anonymous: body.is_anonymous ?? true,
        perpetrator_known: body.perpetrator_known ?? false,
        perpetrator_description: body.perpetrator_description || null,
      })
      .select("case_number, id, created_at")
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to submit report. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      case_number: data.case_number,
      message: "Your report has been submitted successfully. Please save your case number for tracking.",
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
