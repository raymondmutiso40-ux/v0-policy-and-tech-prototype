import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch all authorities
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("authorities")
      .select("*")
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ authorities: data })
  } catch (error) {
    console.error("Error fetching authorities:", error)
    return NextResponse.json({ error: "Failed to fetch authorities" }, { status: 500 })
  }
}

// POST - Add new authority
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("authorities")
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        jurisdiction: body.jurisdiction || [],
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ authority: data })
  } catch (error) {
    console.error("Error creating authority:", error)
    return NextResponse.json({ error: "Failed to create authority" }, { status: 500 })
  }
}

// DELETE - Remove authority
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Authority ID is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("authorities")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting authority:", error)
    return NextResponse.json({ error: "Failed to delete authority" }, { status: 500 })
  }
}
