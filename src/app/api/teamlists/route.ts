import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read team lists from the team-lists directory
    const dataDir = path.join(process.cwd(), 'data', 'team-lists')
    const files = await fs.readdir(dataDir)
    
    // Filter for team list files and parse them
    const teamLists = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const content = await fs.readFile(path.join(dataDir, file), 'utf-8')
          const data = JSON.parse(content)
          return {
            id: file.replace('.json', ''),
            name: data.name || file.replace('.json', '')
          }
        })
    )

    return NextResponse.json(teamLists)
  } catch (error) {
    console.error('Error reading team lists:', error)
    return NextResponse.json({ error: 'Failed to load team lists' }, { status: 500 })
  }
} 