import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Criando usuário administrador...')

    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('⚠️  Usuário administrador já existe:', existingAdmin.email)
      return
    }

    // Criar usuário administrador
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@pratagy.com.br',
        password: await hashPassword('admin123'),
        role: 'ADMIN',
        approved: true,
        sectorId: null
      }
    })

    console.log('✅ Usuário administrador criado com sucesso!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Senha: admin123')
    console.log('👤 Nome:', admin.name)

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
