import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function setupLoginBackground() {
  try {
    console.log('🖼️ Configurando background de login...')

    // Verificar se a pasta de uploads existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'login-background')
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log('✅ Pasta de uploads criada')
    }

    // Criar configuração padrão de background
    const defaultBackground = {
      id: 'default-login-bg',
      filename: 'default-background.jpg',
      originalName: 'default-background.jpg',
      mimeType: 'image/jpeg',
      size: 0,
      path: '/uploads/login-background/default-background.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Verificar se já existe configuração
    const existing = await prisma.loginBackground.findFirst({
      where: { id: defaultBackground.id }
    })

    if (!existing) {
      await prisma.loginBackground.create({
        data: defaultBackground
      })
      console.log('✅ Configuração de background criada')
    } else {
      console.log('⚠️  Configuração de background já existe')
    }

    // Criar arquivo de placeholder se não existir
    const placeholderPath = path.join(uploadsDir, 'default-background.jpg')
    if (!fs.existsSync(placeholderPath)) {
      // Criar um arquivo vazio como placeholder
      fs.writeFileSync(placeholderPath, '')
      console.log('✅ Arquivo placeholder criado')
    }

    console.log('✅ Setup de background de login concluído!')

  } catch (error) {
    console.error('❌ Erro ao configurar background de login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupLoginBackground()
