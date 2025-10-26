import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookie } from '@/lib/session'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { unlink } from 'fs/promises'
import { createProcedureHistory, generateProcedureUpdateDescription } from '@/lib/procedure-history'

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

    const procedure = await db.procedure.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
    }

    return NextResponse.json(procedure)
  } catch (error) {
    console.error('Error fetching procedure:', error)
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

    const { id } = await params
    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as string
    const status = formData.get('status') as string
    const sectorId = formData.get('sectorId') as string
    const documentDateStr = formData.get('documentDate') as string
    const file = formData.get('file') as File
    const removeFile = formData.get('removeFile') as string

    // Get existing procedure to handle file replacement
    const existingProcedure = await db.procedure.findUnique({
      where: { id }
    })

    if (!existingProcedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
    }

    let fileUrl = existingProcedure.fileUrl
    let fileName = existingProcedure.fileName
    let fileSize = existingProcedure.fileSize

    // Handle file upload (replacement) and removal
    if (file && file.size > 0) {
      // Delete old file if exists
      if (existingProcedure.fileUrl) {
        try {
          const oldPath = join(process.cwd(), 'public', existingProcedure.fileUrl)
          await unlink(oldPath)
        } catch (error) {
          console.error('Error deleting old file:', error)
        }
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}_${originalName}`
      
      // Ensure directory exists
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'procedures')
      try {
        await writeFile(join(uploadDir, '.test'), 'test')
        await unlink(join(uploadDir, '.test'))
      } catch (error) {
        // Directory doesn't exist, create it
        const { mkdir } = await import('fs/promises')
        await mkdir(uploadDir, { recursive: true })
      }
      
      // Save file to public directory
      const path = join(uploadDir, filename)
      await writeFile(path, buffer)

      fileUrl = `/uploads/procedures/${filename}`
      fileName = originalName
      fileSize = file.size
    } else if (removeFile === 'true') {
      // File removal requested
      if (existingProcedure.fileUrl) {
        try {
          const oldPath = join(process.cwd(), 'public', existingProcedure.fileUrl)
          await unlink(oldPath)
        } catch (error) {
          console.error('Error deleting file:', error)
        }
      }
      fileUrl = null
      fileName = null
      fileSize = null
    }

    // Calculate expiry date if document date is provided
    let expiryDate = existingProcedure.expiryDate
    if (documentDateStr) {
      const documentDate = new Date(documentDateStr)
      expiryDate = new Date(documentDate)
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (content !== null) updateData.content = content || null
    if (type) updateData.type = type
    if (status) updateData.status = status
    
    if (sectorId !== null) {
      updateData.sectorId = sectorId || null
    }
    if (documentDateStr) updateData.documentDate = new Date(documentDateStr)
    if (expiryDate) updateData.expiryDate = expiryDate
    if (fileUrl !== existingProcedure.fileUrl) {
      updateData.fileUrl = fileUrl
      updateData.fileName = fileName
      updateData.fileSize = fileSize
    }

    const procedure = await db.procedure.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Create history record for procedure update
    try {
      const oldValues = {
        title: existingProcedure.title,
        content: existingProcedure.content,
        type: existingProcedure.type,
        status: existingProcedure.status,
        sectorId: existingProcedure.sectorId,
        documentDate: existingProcedure.documentDate,
        fileUrl: existingProcedure.fileUrl,
      }

      const newValues = {
        title: procedure.title,
        content: procedure.content,
        type: procedure.type,
        status: procedure.status,
        sectorId: procedure.sectorId,
        documentDate: procedure.documentDate,
        fileUrl: procedure.fileUrl,
      }

      const description = generateProcedureUpdateDescription(oldValues, newValues)

      await createProcedureHistory({
        procedureId: procedure.id,
        userId: session.userId,
        action: 'UPDATED',
        description,
        oldValues,
        newValues,
      })
    } catch (historyError) {
      console.error('Error creating procedure history:', historyError)
      // Don't fail the whole operation if history creation fails
    }

    return NextResponse.json(procedure)
  } catch (error) {
    console.error('Error updating procedure:', error)
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

    const { id } = await params

    // Get procedure to delete associated file
    const procedure = await db.procedure.findUnique({
      where: { id }
    })

    if (procedure && procedure.fileUrl) {
      try {
        const path = join(process.cwd(), 'public', procedure.fileUrl)
        await unlink(path)
      } catch (error) {
        console.error('Error deleting file:', error)
      }
    }

    await db.procedure.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Procedure deleted successfully' })
  } catch (error) {
    console.error('Error deleting procedure:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}