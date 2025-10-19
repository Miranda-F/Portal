import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookieFromNextRequest } from '@/lib/session'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { createProcedureHistory } from '@/lib/procedure-history'

async function getAuthUser(request: NextRequest) {
  const token = getSessionCookieFromNextRequest(request)
  if (!token) return null
  
  const session = await verifySession(token)
  if (!session) return null
  
  return { userId: session.userId, userRole: session.role }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, let's check what's in the database
    try {
      const allProcedures = await db.$queryRaw`
        SELECT id, title, type FROM Procedure
      `
      
      console.log('Current procedures in database:', allProcedures)
      
      // Check for old enum values
      const proceduresWithOldTypes = await db.$queryRaw`
        SELECT id, title, type FROM Procedure 
        WHERE type IN ('QUALITY', 'INSPECTION', 'STRATIFICATION', 'ANNOUNCEMENT')
      `
      
      console.log('Procedures with old types:', proceduresWithOldTypes)
      
      if (Array.isArray(proceduresWithOldTypes) && proceduresWithOldTypes.length > 0) {
        // Update them
        const updateResult = await db.$executeRaw`
          UPDATE Procedure 
          SET type = 'MANAGEMENT_PROCEDURE' 
          WHERE type IN ('QUALITY', 'INSPECTION', 'STRATIFICATION', 'ANNOUNCEMENT')
        `
        
        console.log('Updated procedures:', updateResult)
      }
      
      // Now try to get procedures with proper includes
      const procedures = await db.procedure.findMany({
        orderBy: { createdAt: 'desc' },
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

      return NextResponse.json(procedures)
    } catch (error) {
      console.error('Database operation failed:', error)
      
      // If all else fails, try to get procedures without includes first
      try {
        const simpleProcedures = await db.$queryRaw`
          SELECT 
            p.id, p.title, p.content, p.type, p.status, 
            p.documentDate, p.expiryDate, p.fileUrl, p.fileName, p.fileSize,
            p.createdAt, p.updatedAt, p.createdById, p.sectorId,
            u.name as createdByName, u.email as createdByEmail,
            s.name as sectorName
          FROM Procedure p
          LEFT JOIN User u ON p.createdById = u.id
          LEFT JOIN Sector s ON p.sectorId = s.id
          ORDER BY p.createdAt DESC
        `
        
        console.log('Raw query result:', simpleProcedures)
        
        // Transform the result to match the expected format
        const formattedProcedures = Array.isArray(simpleProcedures) ? simpleProcedures.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content,
          type: p.type,
          status: p.status,
          documentDate: p.documentDate,
          expiryDate: p.expiryDate,
          fileUrl: p.fileUrl,
          fileName: p.fileName,
          fileSize: p.fileSize,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          createdById: p.createdById,
          sectorId: p.sectorId,
          createdBy: p.createdByName ? {
            id: p.createdById,
            name: p.createdByName,
            email: p.createdByEmail,
          } : null,
          sector: p.sectorName ? {
            id: p.sectorId,
            name: p.sectorName,
          } : null,
        })) : []
        
        return NextResponse.json(formattedProcedures)
      } catch (rawError) {
        console.error('Raw query also failed:', rawError)
        return NextResponse.json({ 
          error: 'Database error. Please contact administrator.',
          details: error.message 
        }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Error fetching procedures:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as string
    const status = formData.get('status') as string
    const sectorId = formData.get('sectorId') as string
    const documentDateStr = formData.get('documentDate') as string
    const file = formData.get('file') as File

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
    }

    let fileUrl = null
    let fileName = null
    let fileSize = null

    // Handle file upload
    if (file && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const timestamp = Date.now()
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filename = `${timestamp}_${originalName}`
        
        // Save file to public directory
        const path = join(process.cwd(), 'public', 'uploads', 'procedures', filename)
        console.log('Saving file to:', path)
        await writeFile(path, buffer)
        console.log('File saved successfully')

        fileUrl = `/uploads/procedures/${filename}`
        fileName = originalName
        fileSize = file.size
      } catch (fileError) {
        console.error('Error saving file:', fileError)
        return NextResponse.json({ 
          error: 'Error saving file', 
          details: fileError.message 
        }, { status: 500 })
      }
    }

    // Calculate expiry date if document date is provided
    let expiryDate = null
    if (documentDateStr) {
      const documentDate = new Date(documentDateStr)
      expiryDate = new Date(documentDate)
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    }

    const createData: any = {
      title,
      content: content || null,
      type,
      status: status || 'PUBLISHED',
      createdById: authUser.userId,
    }

    if (sectorId && sectorId !== "none") createData.sectorId = sectorId
    if (documentDateStr) createData.documentDate = new Date(documentDateStr)
    if (expiryDate) createData.expiryDate = expiryDate
    if (fileUrl) {
      createData.fileUrl = fileUrl
      createData.fileName = fileName
      createData.fileSize = fileSize
    }

    try {
      const procedure = await db.procedure.create({
        data: createData,
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
      console.log('Procedure created successfully:', procedure.id)

      // Create history record for procedure creation
      try {
        await createProcedureHistory({
          procedureId: procedure.id,
          userId: authUser.userId,
          action: 'CREATED',
          description: 'Procedimento criado',
          newValues: {
            title: procedure.title,
            type: procedure.type,
            status: procedure.status,
            sectorId: procedure.sectorId,
            documentDate: procedure.documentDate,
            fileUrl: procedure.fileUrl,
          }
        })
        console.log('Procedure history created successfully')
      } catch (historyError) {
        console.error('Error creating procedure history:', historyError)
        // Don't fail the whole operation if history creation fails
      }

      return NextResponse.json(procedure)
    } catch (dbError) {
      console.error('Error creating procedure in database:', dbError)
      return NextResponse.json({ 
        error: 'Error creating procedure in database', 
        details: dbError.message 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating procedure:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}