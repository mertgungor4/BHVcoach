import { NextResponse } from 'next/server'
import { teams } from '@/data/teams'

export async function GET() {
  try {
    return NextResponse.json(teams)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
} 