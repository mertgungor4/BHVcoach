import { NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const dirPath = join(process.cwd(), 'data', 'team-lists')
    const files = await readdir(dirPath)
    
    const lists = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const filePath = join(dirPath, file)
          const content = await readFile(filePath, 'utf-8')
          return JSON.parse(content)
        })
    )

    return NextResponse.json(lists)
  } catch (error) {
    console.error('Error loading team lists:', error)
    return NextResponse.json(
      { error: 'Error loading team lists' },
      { status: 500 }
    )
  }
} 