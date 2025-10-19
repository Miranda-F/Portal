import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { parse } from 'cookie'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session cookie directly from request
    const cookieHeader = request.headers.get('cookie')
    
    if (!cookieHeader) {
      return NextResponse.json({ error: 'No session cookie found' }, { status: 401 })
    }
    
    const cookies = parse(cookieHeader)
    const token = cookies.access_token
    
    if (!token) {
      return NextResponse.json({ error: 'No session token found' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transferToSectorId } = await request.json()
    const sectorId = params.id

    // Get the sector to be toggled
    const sector = await db.sector.findUnique({
      where: { id: sectorId },
      include: {
        _count: {
          select: {
            users: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!sector) {
      return NextResponse.json({ error: 'Sector not found' }, { status: 404 })
    }

    // Check if sector has users
    if (sector._count.users > 0) {
      // If trying to deactivate and there are users, check if we need to transfer
      if (sector.active && !transferToSectorId) {
        return NextResponse.json({
          error: 'Cannot deactivate sector with users',
          hasUsers: true,
          userCount: sector._count.users,
          users: sector.users
        }, { status: 400 })
      }

      // If transferToSectorId is provided, transfer users
      if (transferToSectorId) {
        // Verify the target sector exists and is active
        const targetSector = await db.sector.findUnique({
          where: { id: transferToSectorId, active: true }
        })

        if (!targetSector) {
          return NextResponse.json({ error: 'Target sector not found or inactive' }, { status: 400 })
        }

        // Transfer all users to the target sector
        await db.user.updateMany({
          where: { sectorId: sectorId },
          data: { sectorId: transferToSectorId }
        })
      }
    }

    // Toggle the sector status
    const updatedSector = await db.sector.update({
      where: { id: sectorId },
      data: { active: !sector.active },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json(updatedSector)
  } catch (error) {
    console.error('Error toggling sector:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}