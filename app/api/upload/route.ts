import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validate file types (images, PDFs, documents)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
    ]

    const maxSize = 10 * 1024 * 1024 // 10MB per file

    const uploadedFiles = []

    for (const file of files) {
      // Validate type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} not allowed. Allowed: images, PDF, video, audio` },
          { status: 400 }
        )
      }

      // Validate size
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10MB limit` },
          { status: 400 }
        )
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const pathname = `evidence/${timestamp}-${randomId}.${extension}`

      // Upload to Vercel Blob (private storage)
      const blob = await put(pathname, file, {
        access: 'private',
      })

      uploadedFiles.push({
        pathname: blob.pathname,
        filename: file.name,
        size: file.size,
        type: file.type,
      })
    }

    return NextResponse.json({ 
      success: true,
      files: uploadedFiles 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
