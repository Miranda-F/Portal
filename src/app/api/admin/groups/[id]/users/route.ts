import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const groupUsers = await db.groupUser.findMany({
      where: { groupId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            approved: true
          }
        }
      }
    })

    return NextResponse.json(groupUsers.map(gu => gu.user))
  } catch (error) {
    console.error('Error fetching group users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userIds } = await request.json()

    if (!Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds must be an array' }, { status: 400 })
    }

    // Remove all existing users from the group
    await db.groupUser.deleteMany({
      where: { groupId: params.id }
    })

    // Add new users to the group
    if (userIds.length > 0) {
      await db.groupUser.createMany({
        data: userIds.map((userId: string) => ({
          groupId: params.id,
          userId
        }))
      })
    }

    return NextResponse.json({ message: 'Group users updated successfully' })
  } catch (error) {
    console.error('Error updating group users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getSessionCookie(request)
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const session = await verifySession(token)
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove all users from the group
    await db.groupUser.deleteMany({
      where: { groupId: params.id }
    })

    return NextResponse.json({ message: 'All users removed from group successfully' })
  } catch (error) {
    console.error('Error removing users from group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}