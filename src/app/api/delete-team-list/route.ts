import { NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const fileName = `${name.toLowerCase().replace(/\s+/g, '_')}.json`
    const filePath = join(process.cwd(), 'data', 'team-lists', fileName)

    // Dosyayı sil
    await unlink(filePath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team list:', error)
    return NextResponse.json(
      { error: 'Error deleting team list' },
      { status: 500 }
    )
  }
} 