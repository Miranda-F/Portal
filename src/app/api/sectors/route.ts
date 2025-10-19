import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCachedRoute, CacheType } from '@/lib/api-cache'

async function getSectors() {
  const sectors = await db.sector.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      active: true,
      _count: {
        select: {
          users: true
        }
      }
    }
  })

  return sectors
}

// Setores são dados que mudam com pouca frequência - usar cache estático
export const GET = createCachedRoute(
  async () => {
    try {
      const sectors = await getSectors()
      return sectors
    } catch (error) {
      console.error('Error fetching sectors:', error)
      throw new Error('Internal server error')
    }
  },
  {
    type: CacheType.STATIC,
    tags: ['sectors'],
    revalidate: 60 * 60 // 1 hora
  }
)