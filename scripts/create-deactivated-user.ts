import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function createDeactivatedUser() {
  try {
    const hashedPassword = await hashPassword('test123')
    
    const deactivatedUser = await prisma.user.create({
      data: {
        email: 'deactivated@pratagy.com.br',
        name: 'Usuário Desativado',
        password: hashedPassword,
        role: 'USER',
        approved: false, // Usuário desativado
      },
    })
    
    console.log('Usuário desativado criado com sucesso:', {
      id: deactivatedUser.id,
      email: deactivatedUser.email,
      name: deactivatedUser.name,
      role: deactivatedUser.role,
      approved: deactivatedUser.approved,
    })
    
    console.log('Você pode testar o login com:')
    console.log('Email: deactivated@pratagy.com.br')
    console.log('Password: test123')
    console.log('Este usuário deve receber a mensagem de conta desativada.')
  } catch (error) {
    console.error('Erro ao criar usuário desativado:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDeactivatedUser()