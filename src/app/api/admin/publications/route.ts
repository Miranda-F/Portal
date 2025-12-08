import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const publications = await prisma.publication.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sectorTargets: {
          include: {
            sector: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        groupTargets: {
          include: {
            group: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        userTargets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ publications })
  } catch (error) {
    console.error('Error fetching publications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, createdById, sectorTargets, groupTargets, userTargets } = body

    const publication = await prisma.publication.create({
      data: {
        title,
        content,
        createdById,
        sectorTargets: {
          create: sectorTargets?.map((sectorId: string) => ({
            sectorId
          })) || []
        },
        groupTargets: {
          create: groupTargets?.map((groupId: string) => ({
            groupId
          })) || []
        },
        userTargets: {
          create: userTargets?.map((userId: string) => ({
            userId
          })) || []
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sectorTargets: {
          include: {
            sector: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        groupTargets: {
          include: {
            group: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        userTargets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ publication })
  } catch (error) {
    console.error('Error creating publication:', error)
    return NextResponse.json(
      { error: 'Failed to create publication' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

