import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get only social media settings
    const socialMediaKeys = ['social_facebook_url', 'social_linkedin_url', 'social_instagram_url']
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: socialMediaKeys
        }
      }
    })
    
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