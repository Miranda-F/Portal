import { NextRequest, NextResponse } from 'next/server'
import { getServerSession, getSessionCookieFromNextRequest } from '@/lib/session'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import bcrypt from 'bcryptjs'
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const sectorId = formData.get('sectorId') as string
    const showIdentityCard = formData.get('showIdentityCard') as string
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const photo = formData.get('photo') as File | null

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { id: session.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se o email já está em uso por outro usuário
    if (email && email !== currentUser.email) {
      const existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json({ error: 'E-mail já está em uso' }, { status: 400 })
      }
    }

    // Verify current password if changing password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Senha atual é obrigatória para alterar a senha' }, { status: 400 })
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password)
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
      }
    }

    let photoUrl = currentUser.photoUrl

    // Check if photo should be removed
    const removePhoto = formData.get('removePhoto') === 'true'
    console.log('Remove photo flag:', removePhoto)
    
    if (removePhoto) {
      console.log('Removing profile photo...')
      console.log('Current user photoUrl:', currentUser.photoUrl)
      
      // Delete old photo if exists
      if (currentUser.photoUrl && currentUser.photoUrl.startsWith('/uploads/profiles/')) {
        const oldFilePath = join(process.cwd(), 'public', currentUser.photoUrl)
        console.log('Attempting to delete file:', oldFilePath)
        try {
          // Import fs module for proper file deletion
          const { unlink } = await import('fs/promises')
          await unlink(oldFilePath)
          console.log('Old photo deleted:', oldFilePath)
        } catch (error) {
          console.warn('Could not delete old profile photo:', error)
        }
      }
      
      // Set photoUrl to null
      photoUrl = null
      console.log('PhotoUrl set to null')
    }

    // Handle photo upload
    if (photo) {
      try {
        console.log('Processing photo upload:', photo.name, photo.size, photo.type)
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
        await mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const fileName = `${currentUser.id}-${Date.now()}-${photo.name}`
        const filePath = join(uploadDir, fileName)

        // Write file
        await writeFile(filePath, buffer)
        console.log('Photo saved successfully:', filePath)

        // Update photo URL
        photoUrl = `/uploads/profiles/${fileName}`

        // Delete old photo if exists
        if (currentUser.photoUrl && currentUser.photoUrl.startsWith('/uploads/profiles/')) {
          const oldFilePath = join(process.cwd(), 'public', currentUser.photoUrl)
          try {
            // Import fs module for proper file deletion
            const { unlink } = await import('fs/promises')
            await unlink(oldFilePath)
            console.log('Old photo deleted:', oldFilePath)
          } catch (error) {
            console.warn('Could not delete old profile photo:', error)
          }
        }
      } catch (error) {
        console.error('Error uploading photo:', error)
        return NextResponse.json({ error: 'Erro ao fazer upload da foto' }, { status: 500 })
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(name && { name }),
      ...(email && { email }),
      sectorId: sectorId || null, // Always include sectorId, even if it's empty
      showIdentityCard: showIdentityCard === 'true', // Convert string to boolean
      ...(photoUrl !== undefined && { photoUrl }) // Include photoUrl even if it's null
    }

    // Add password update if provided
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updateData.password = hashedPassword
    }

    // Atualizar o usuário
    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        sectorId: true,
        showIdentityCard: true,
        photoUrl: true,
        sector: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('Updated user photoUrl:', updatedUser.photoUrl)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}