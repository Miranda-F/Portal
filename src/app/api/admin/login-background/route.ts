import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionCookieFromNextRequest } from '@/lib/session'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { db } from '@/lib/db'
import * as fs from 'fs/promises'
import * as path from 'path'

async function getAdminUser(request: NextRequest) {
  const token = getSessionCookieFromNextRequest(request)
  if (!token) {
    return null
  }

  const session = await verifySession(token)
  if (!session) {
    return null
  }
  
  if (session.role !== 'ADMIN') {
    return null
  }

  return session
}

export async function GET() {
  try {
    // Listar todos os arquivos na pasta de login-background
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'login-background')
    
    let imageFiles = []
    try {
      const files = await fs.readdir(uploadsDir)
      imageFiles = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase()
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
        })
        .map(file => `/uploads/login-background/${file}`)
    } catch (error) {
      // Diretório não existe ou não há permissão
      console.log('Login background directory not found or empty')
    }

    // Buscar a configuração da imagem de fundo no banco de dados (para compatibilidade)
    const setting = await db.setting.findUnique({
      where: { key: 'login_background_image' }
    })

    return NextResponse.json({ 
      backgroundImageUrl: setting?.value || null,
      backgroundImages: imageFiles 
    })
  } catch (error) {
    console.error('Error fetching login background:', error)
    return NextResponse.json(
      { error: 'Failed to fetch login background' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('backgroundImages') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'login-background')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Diretório já existe
    }

    const uploadedImages = []

    for (const file of files) {
      // Validar se é uma imagem
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'All files must be images' },
          { status: 400 }
        )
      }

      // Validar tamanho do arquivo (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 50MB' },
          { status: 400 }
        )
      }

      // Gerar nome de arquivo único
      const timestamp = Date.now() + Math.random()
      const fileName = `login-background-${timestamp}${file.name.substring(file.name.lastIndexOf('.'))}`
      const filePath = join(uploadsDir, fileName)

      // Salvar o arquivo
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      const imageUrl = `/uploads/login-background/${fileName}`
      uploadedImages.push(imageUrl)
    }

    // Atualizar a configuração no banco de dados com a primeira imagem (para compatibilidade)
    if (uploadedImages.length > 0) {
      await db.setting.upsert({
        where: { key: 'login_background_image' },
        update: { value: uploadedImages[0] },
        create: { key: 'login_background_image', value: uploadedImages[0] }
      })
    }

    const response = NextResponse.json({
      backgroundImages: uploadedImages,
      message: `${uploadedImages.length} login background images uploaded successfully`
    })
    
    // Adicionar headers CORS
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error) {
    console.error('Error uploading login background:', error)
    return NextResponse.json(
      { error: 'Failed to upload login background images' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
    }

    // Validar o nome do arquivo para evitar path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      )
    }

    const filePath = join(process.cwd(), 'public', 'uploads', 'login-background', fileName)

    try {
      // Remover o arquivo físico
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting physical file:', error)
      return NextResponse.json(
        { error: 'File not found or could not be deleted' },
        { status: 404 }
      )
    }

    // Verificar se a imagem deletada era a configurada no banco de dados
    const setting = await db.setting.findUnique({
      where: { key: 'login_background_image' }
    })

    if (setting?.value === `/uploads/login-background/${fileName}`) {
      // Remover a configuração do banco de dados
      await db.setting.delete({
        where: { key: 'login_background_image' }
      })
    }

    return NextResponse.json({
      message: 'Login background image deleted successfully'
    })
  } catch (error) {
    console.error('Error removing login background:', error)
    return NextResponse.json(
      { error: 'Failed to remove login background image' },
      { status: 500 }
    )
  }
}