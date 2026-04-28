import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Simple admin password for hackathon demo
// In production, use proper authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "safereport2026"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const password = searchParams.get("password")

  // Basic auth check for demo
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching cases:", error)
      return NextResponse.json(
        { error: "Failed to fetch cases" },
        { status: 500 }
      )
    }

    // Calculate stats
    const stats = {
      total: data?.length || 0,
      submitted: data?.filter(r => r.status === "submitted").length || 0,
      under_review: data?.filter(r => r.status === "under_review").length || 0,
      investigation: data?.filter(r => r.status === "investigation").length || 0,
      resolved: data?.filter(r => r.status === "resolved").length || 0,
      urgent: data?.filter(r => r.priority === "urgent").length || 0,
    }

    return NextResponse.json({ cases: data, stats })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Update case status
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const password = searchParams.get("password")

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { case_id, status, priority } = body

    if (!case_id) {
      return NextResponse.json(
        { error: "Case ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updateData: Record<string, string> = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority

    const { data, error } = await supabase
      .from("reports")
      .update(updateData)
      .eq("id", case_id)
      .select()
      .single()

    if (error) {
      console.error("Error updating case:", error)
      return NextResponse.json(
        { error: "Failed to update case" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Case updated successfully",
      case: data
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
