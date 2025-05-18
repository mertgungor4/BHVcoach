import { NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const list = await request.json()
    const fileName = `${list.name.toLowerCase().replace(/\s+/g, '_')}.json`
    const dirPath = join(process.cwd(), 'data', 'team-lists')
    const filePath = join(dirPath, fileName)

    // Klasör yoksa oluştur
    await mkdir(dirPath, { recursive: true })

    // Dosyayı kaydet
    await writeFile(filePath, JSON.stringify(list, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving team list:', error)
    return NextResponse.json(
      { error: 'Error saving team list' },
      { status: 500 }
    )
  }
} 