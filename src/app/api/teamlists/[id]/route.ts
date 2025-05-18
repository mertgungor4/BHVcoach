import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const filePath = path.join(process.cwd(), 'data', 'team-lists', `${id}.json`)
    
    const content = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading team list:', error)
    return NextResponse.json({ error: 'Failed to load team list' }, { status: 500 })
  }
} 