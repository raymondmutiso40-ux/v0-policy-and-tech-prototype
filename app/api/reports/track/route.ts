import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Track a report by case number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseNumber = searchParams.get("case_number")

    if (!caseNumber) {
      return NextResponse.json(
        { error: "Case number is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Only return limited information for privacy
    const { data, error } = await supabase
      .from("reports")
      .select("case_number, status, incident_type, created_at, updated_at")
      .eq("case_number", caseNumber.toUpperCase())
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Report not found. Please check your case number." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      report: {
        case_number: data.case_number,
        status: data.status,
        incident_type: data.incident_type,
        submitted_at: data.created_at,
        last_updated: data.updated_at,
      },
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
