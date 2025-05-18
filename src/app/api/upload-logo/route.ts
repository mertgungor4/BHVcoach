import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (!file || !fileName) {
      return NextResponse.json(
        { error: 'File and fileName are required' },
        { status: 400 }
      )
    }

    // Dosyayı byte array'e çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Public/logos klasörüne kaydet
    const path = join(process.cwd(), 'public', 'logos', fileName)
    await writeFile(path, buffer)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
} 