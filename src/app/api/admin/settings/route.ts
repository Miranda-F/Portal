import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all settings
    const settings = await db.setting.findMany()
    
    // Convert to key-value object
    const settingsObj: Record<string, string> = {}
    settings.forEach(setting => {
      if (setting.value) {
        settingsObj[setting.key] = setting.value
      }
    })

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, value } = await request.json()
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    // Upsert the setting
    const setting = await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error saving setting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}